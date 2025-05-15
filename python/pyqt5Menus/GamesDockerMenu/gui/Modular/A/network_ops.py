import requests
from PyQt5.QtGui import QImage
from requests.adapters import HTTPAdapter, Retry
from howlongtobeatpy import HowLongToBeat
from utils import normalize_game_title

# Create a requests session with retries
session = requests.Session()
retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retries)
session.mount("http://", adapter)
session.mount("https://", adapter)

def fetch_game_time(alias):
    normalized = normalize_game_title(alias)
    try:
        results = HowLongToBeat().search(normalized)
        if results:
            main_time = getattr(results[0], 'gameplay_main', None) or getattr(results[0], 'main_story', None)
            if main_time:
                return (alias, f"{main_time} hours")
            extra_time = getattr(results[0], 'gameplay_main_extra', None) or getattr(results[0], 'main_extra', None)
            if extra_time:
                return (alias, f"{extra_time} hours")
    except Exception as e:
        print(f"Error searching HowLongToBeat for '{normalized}': {e}")
    return (alias, "N/A")

def fetch_image(query):
    api_key = "a0278acb920e45e1bcc232b06f72bace"
    url = "https://api.rawg.io/api/games"
    params = {"key": api_key, "search": query, "page_size": 1}
    try:
        response = session.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            if results:
                image_url = results[0].get("background_image")
                if image_url:
                    img_response = session.get(image_url, stream=True, timeout=10)
                    if img_response.status_code == 200:
                        img = QImage()
                        img.loadFromData(img_response.content)
                        if not img.isNull():
                            return (query, img)
    except Exception as e:
        print(f"RAWG image fetch error for '{query}':", e)
    return (query, QImage())
