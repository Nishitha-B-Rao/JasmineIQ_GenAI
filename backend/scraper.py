from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re

import time

_cache = {
    "timestamp": 0,
    "prices": {}
}
CACHE_TTL = 300  # 5 minutes

def get_live_price(variety: str) -> int:
    """
    Scrape the live price of a specific Jasmine variety from The Canara Post.
    Uses a 5-minute in-memory cache to prevent blocking dashboard loads.
    """
    current_time = time.time()
    if current_time - _cache["timestamp"] < CACHE_TTL and variety in _cache["prices"]:
        return _cache["prices"][variety]

    url = "https://thecanarapost.com/2021/12/25/udupi-jasmine-todays-price-19/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Check if the article was updated today
        meta_modified = soup.find('meta', property='article:modified_time')
        meta_published = soup.find('meta', property='article:published_time')
        
        article_date = None
        if meta_modified and meta_modified.get('content'):
            article_date = meta_modified['content']
        elif meta_published and meta_published.get('content'):
            article_date = meta_published['content']
            
        if article_date:
            today_str = datetime.now().strftime('%Y-%m-%d')
            if today_str not in article_date:
                print(f"Scraped price is from an older date: {article_date}. Waiting for today's update.")
                _cache["prices"]["Mallige"] = None
                _cache["prices"]["Jaaji"] = None
                _cache["timestamp"] = current_time
                return None

        tables = soup.find_all('table')
        if not tables:
            return None

        first_table = tables[0]
        
        new_prices = {}
        for row in first_table.find_all('tr'):
            text = row.get_text().strip()
            
            if "mallige" in text.lower():
                match = re.search(r'mallige:\s*(\d+)', text, re.IGNORECASE)
                if match:
                    new_prices["Mallige"] = int(match.group(1))
                    
            if "jaaji" in text.lower():
                match = re.search(r'jaaji:\s*(\d+)', text, re.IGNORECASE)
                if match:
                    new_prices["Jaaji"] = int(match.group(1))

        _cache["prices"] = new_prices
        _cache["timestamp"] = current_time
        
        return _cache["prices"].get(variety)
        
    except Exception as e:
        print(f"Scraping failed: {e}")
        return None
