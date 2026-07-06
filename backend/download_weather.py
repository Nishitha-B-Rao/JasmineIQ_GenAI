from datetime import datetime
from pathlib import Path

import pandas as pd
import requests
from meteostat import Parameter, Point, config, daily, stations


DATA_DIR = Path(__file__).resolve().parent / "data"
PRICE_PATH = DATA_DIR / "dataset.csv"
OUTPUT_PATH = DATA_DIR / "historical_weather.csv"
CACHE_DIR = DATA_DIR / ".meteostat_cache"
STATIONS_DB_PATH = CACHE_DIR / "stations.db"
WEATHER_COLUMNS = ["Rainfall_mm", "Temperature_C", "Humidity_Pct"]
UDUPI_LATITUDE = 13.3389
UDUPI_LONGITUDE = 74.7451
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

# Udupi, Karnataka. Meteostat will resolve nearby stations where direct
# observations are unavailable.
UDUPI = Point(UDUPI_LATITUDE, UDUPI_LONGITUDE)


def get_price_date_range() -> tuple[datetime, datetime]:
    prices = pd.read_csv(PRICE_PATH, usecols=["Date"])
    dates = pd.to_datetime(prices["Date"], errors="coerce").dropna()
    return dates.min().to_pydatetime(), dates.max().to_pydatetime()


def fetch_open_meteo_udupi(start: datetime, end: datetime) -> pd.DataFrame:
    params = {
        "latitude": UDUPI_LATITUDE,
        "longitude": UDUPI_LONGITUDE,
        "start_date": start.strftime("%Y-%m-%d"),
        "end_date": end.strftime("%Y-%m-%d"),
        "daily": ",".join(
            [
                "precipitation_sum",
                "temperature_2m_mean",
            ]
        ),
        "hourly": "relative_humidity_2m",
        "timezone": "Asia/Kolkata",
    }
    response = requests.get(OPEN_METEO_ARCHIVE_URL, params=params, timeout=60)
    response.raise_for_status()
    payload = response.json()

    if "daily" not in payload or "time" not in payload["daily"]:
        raise RuntimeError(f"Open-Meteo returned no daily Udupi weather data: {payload}")

    daily_data = payload["daily"]
    weather = pd.DataFrame(
        {
            "Date": pd.to_datetime(daily_data["time"]),
            "Rainfall_mm": daily_data["precipitation_sum"],
            "Temperature_C": daily_data["temperature_2m_mean"],
        }
    )

    hourly_data = payload.get("hourly", {})
    if "time" in hourly_data and "relative_humidity_2m" in hourly_data:
        humidity = pd.DataFrame(
            {
                "Date": pd.to_datetime(hourly_data["time"]).normalize(),
                "Humidity_Pct": hourly_data["relative_humidity_2m"],
            }
        )
        humidity = humidity.groupby("Date", as_index=False)["Humidity_Pct"].mean()
        weather = weather.merge(humidity, on="Date", how="left")
    else:
        weather["Humidity_Pct"] = pd.NA

    weather["WeatherSource"] = (
        f"Open-Meteo archive exact Udupi coordinate "
        f"({UDUPI_LATITUDE}, {UDUPI_LONGITUDE})"
    )
    return weather


def normalize_weather(weather: pd.DataFrame) -> pd.DataFrame:
    expected_columns = ["time", "prcp", "temp", "tavg"]
    available_columns = [column for column in expected_columns if column in weather.columns]
    weather = weather[available_columns].rename(
        columns={
            "time": "Date",
            "prcp": "Rainfall_mm",
            "temp": "Temperature_C",
            "tavg": "Temperature_C",
        }
    )

    for column in WEATHER_COLUMNS:
        if column not in weather.columns:
            weather[column] = pd.NA
        weather[column] = pd.to_numeric(weather[column], errors="coerce")

    weather["Date"] = pd.to_datetime(weather["Date"]).dt.normalize()
    return weather[["Date", *WEATHER_COLUMNS]]


def fetch_daily_for_station(station_id: str, start: datetime, end: datetime) -> pd.DataFrame:
    weather = daily(
        station_id,
        start,
        end,
        parameters=[Parameter.PRCP, Parameter.TEMP, Parameter.TMIN, Parameter.TMAX],
    ).fetch()

    if weather is None:
        return pd.DataFrame()

    return normalize_weather(weather.reset_index())


def fill_from_nearby_stations(start: datetime, end: datetime) -> pd.DataFrame:
    calendar = pd.DataFrame({"Date": pd.date_range(start, end, freq="D")})
    for column in WEATHER_COLUMNS:
        calendar[column] = pd.NA
    calendar["WeatherSource"] = pd.NA

    nearby_stations = stations.nearby(UDUPI, radius=300000, limit=15)
    if nearby_stations.empty:
        raise RuntimeError("Meteostat found no stations within 300 km of Udupi.")

    used_stations = []
    for station_id, station in nearby_stations.iterrows():
        candidate = fetch_daily_for_station(station_id, start, end)
        if candidate.empty:
            continue

        station_label = (
            f"{station_id} {station.get('name', 'Unknown')} "
            f"({round(station.get('distance', 0) / 1000, 1)} km)"
        )
        used_stations.append(station_label)

        candidate = candidate.set_index("Date")
        calendar = calendar.set_index("Date")
        before = calendar[WEATHER_COLUMNS].notna().any(axis=1)

        for column in WEATHER_COLUMNS:
            calendar[column] = calendar[column].combine_first(candidate[column])

        after = calendar[WEATHER_COLUMNS].notna().any(axis=1)
        newly_filled = after & ~before
        calendar.loc[newly_filled, "WeatherSource"] = station_label
        calendar = calendar.reset_index()

        if calendar[WEATHER_COLUMNS].notna().all(axis=1).all():
            break

    if not used_stations:
        raise RuntimeError("Nearby Meteostat stations returned no daily weather rows.")

    print("Used stations:")
    for station in used_stations:
        print(f"- {station}")

    return calendar


def impute_weather_gaps(weather: pd.DataFrame) -> pd.DataFrame:
    weather = weather.copy()
    weather["WeatherImputed"] = weather[WEATHER_COLUMNS].isna().any(axis=1)
    weather["DayOfYear"] = weather["Date"].dt.dayofyear
    weather["Month"] = weather["Date"].dt.month

    for column in WEATHER_COLUMNS:
        weather[column] = pd.to_numeric(weather[column], errors="coerce")
        day_values = weather.groupby("DayOfYear")[column].transform("median")
        month_values = weather.groupby("Month")[column].transform("median")
        global_value = weather[column].median()
        if pd.isna(global_value):
            global_value = 0
        weather[column] = weather[column].fillna(day_values).fillna(month_values).fillna(global_value)

    weather.loc[weather["WeatherImputed"], "WeatherSource"] = weather.loc[
        weather["WeatherImputed"], "WeatherSource"
    ].fillna("Imputed from seasonal median")
    weather["WeatherSource"] = weather["WeatherSource"].fillna("Meteostat nearby station")

    return weather[["Date", *WEATHER_COLUMNS, "WeatherSource", "WeatherImputed"]]


def download_weather(start_date: str | None = None, end_date: str | None = None) -> pd.DataFrame:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    config.cache_directory = str(CACHE_DIR)
    config.stations_db_file = str(STATIONS_DB_PATH)

    price_start, price_end = get_price_date_range()
    start = datetime.strptime(start_date, "%Y-%m-%d") if start_date else price_start
    end = datetime.strptime(end_date, "%Y-%m-%d") if end_date else price_end

    try:
        weather = fetch_open_meteo_udupi(start, end)
        print(f"Used exact Udupi coordinates: {UDUPI_LATITUDE}, {UDUPI_LONGITUDE}")
    except Exception as exc:
        print(f"Open-Meteo exact Udupi fetch failed: {exc}")
        print("Falling back to nearby Meteostat stations.")
        weather = fill_from_nearby_stations(start, end)

    full_dates = pd.DataFrame({"Date": pd.date_range(start, end, freq="D")})
    weather = full_dates.merge(weather, on="Date", how="left")
    observed_rows = int(weather[WEATHER_COLUMNS].notna().all(axis=1).sum())
    weather = impute_weather_gaps(weather)
    weather["Date"] = weather["Date"].dt.date

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    weather.to_csv(OUTPUT_PATH, index=False)

    print(weather.head())
    print(weather.columns.tolist())
    print(weather.isnull().sum())
    print(f"Observed complete rows before imputation: {observed_rows}")
    print(f"Imputed rows: {int(weather['WeatherImputed'].sum())}")
    print(f"Saved {len(weather)} rows to {OUTPUT_PATH}")

    return weather


if __name__ == "__main__":
    download_weather()
