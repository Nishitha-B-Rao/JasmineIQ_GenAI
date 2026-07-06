from pathlib import Path

import pandas as pd


DATA_DIR = Path(__file__).resolve().parent / "data"
PRICE_PATH = DATA_DIR / "dataset.csv"
WEATHER_PATH = DATA_DIR / "historical_weather.csv"
FESTIVAL_PATH = DATA_DIR / "festival.csv"
OUTPUT_PATH = DATA_DIR / "master_training_dataset.csv"


def standardize_dates(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"])
    df["Date"] = df["Date"].dt.normalize()
    return df


def load_price_data(path: Path = PRICE_PATH) -> pd.DataFrame:
    prices = standardize_dates(pd.read_csv(path))

    if {"Variety", "Price_Atte"}.issubset(prices.columns):
        prices = prices[["Date", "Variety", "Price_Atte"]]
    else:
        varieties = [column for column in prices.columns if column != "Date"]
        prices = prices.melt(
            id_vars="Date",
            value_vars=varieties,
            var_name="Variety",
            value_name="Price_Atte",
        )

    prices["Price_Atte"] = pd.to_numeric(prices["Price_Atte"], errors="coerce")
    prices = prices.dropna(subset=["Price_Atte"])
    prices = prices[prices["Price_Atte"] > 0]
    return prices.sort_values(["Variety", "Date"]).reset_index(drop=True)


def load_weather_data(path: Path = WEATHER_PATH) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame(
            columns=[
                "Date",
                "Rainfall_mm",
                "Temperature_C",
                "Humidity_Pct",
            ]
        )

    weather = standardize_dates(pd.read_csv(path))
    rename_map = {
        "prcp": "Rainfall_mm",
        "tavg": "Temperature_C",
        "temp": "Temperature_C",
        "AvgTemperature_C": "Temperature_C",
        "rhum": "Humidity_Pct",
    }
    weather = weather.rename(columns=rename_map)

    for column in ["Rainfall_mm", "Temperature_C", "Humidity_Pct"]:
        if column not in weather.columns:
            weather[column] = pd.NA
        weather[column] = pd.to_numeric(weather[column], errors="coerce")

    return weather[
        [
            "Date",
            "Rainfall_mm",
            "Temperature_C",
            "Humidity_Pct",
        ]
    ].drop_duplicates(subset=["Date"])


def load_festival_data(path: Path = FESTIVAL_PATH) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame(columns=["Date", "Festival", "DemandMultiplier"])

    festivals = standardize_dates(pd.read_csv(path))
    festivals["Festival"] = festivals["Festival"].fillna("NoFestival")
    festivals["DemandMultiplier"] = pd.to_numeric(
        festivals["DemandMultiplier"], errors="coerce"
    ).fillna(1.0)
    return festivals[["Date", "Festival", "DemandMultiplier"]].drop_duplicates(subset=["Date"])


def season_from_month(month: int) -> str:
    if month in [6, 7, 8, 9]:
        return "Monsoon"
    if month in [10, 11, 12, 1, 2]:
        return "PostMonsoonWinter"
    return "Summer"


def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Year"] = df["Date"].dt.year
    df["Month"] = df["Date"].dt.month
    df["Quarter"] = df["Date"].dt.quarter
    df["DayOfWeek"] = df["Date"].dt.day_name()
    df["WeekOfYear"] = df["Date"].dt.isocalendar().week.astype(int)
    df["IsWeekend"] = df["Date"].dt.dayofweek.isin([5, 6]).astype(int)
    return df


def add_price_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["Variety", "Date"]).copy()
    grouped = df.groupby("Variety", group_keys=False)["Price_Atte"]
    df["Lag_1"] = grouped.shift(1)
    df["Lag_7"] = grouped.shift(7)
    df["RollingMean7"] = grouped.transform(lambda values: values.shift(1).rolling(7).mean())
    df["RollingMean30"] = grouped.transform(lambda values: values.shift(1).rolling(30).mean())
    return df


def build_master_dataset() -> pd.DataFrame:
    prices = load_price_data()
    weather = load_weather_data()
    festivals = load_festival_data()

    master = prices.merge(weather, on="Date", how="left")
    master = master.merge(festivals, on="Date", how="left")
    master["Festival"] = master["Festival"].fillna("NoFestival")
    master["DemandMultiplier"] = master["DemandMultiplier"].fillna(1.0)

    master = add_time_features(master)
    master = add_price_features(master)

    ordered_columns = [
        "Date",
        "Variety",
        "Price_Atte",
        "Rainfall_mm",
        "Temperature_C",
        "Humidity_Pct",
        "Festival",
        "DemandMultiplier",
        "Year",
        "Month",
        "Quarter",
        "DayOfWeek",
        "WeekOfYear",
        "IsWeekend",
        "Lag_1",
        "Lag_7",
        "RollingMean7",
        "RollingMean30",
    ]
    master = master[ordered_columns].sort_values(["Date", "Variety"]).reset_index(drop=True)
    master.to_csv(OUTPUT_PATH, index=False)

    print(master.head())
    print(master.columns.tolist())
    print(master.isnull().sum())
    print(f"Saved {len(master)} rows to {OUTPUT_PATH}")

    return master


if __name__ == "__main__":
    build_master_dataset()
