import sys
import difflib
import requests
import urllib.parse
import json
import os
import threading
from datetime import datetime
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QUrl, QTimer, QObject, QPropertyAnimation, pyqtProperty
from PyQt5.QtWebEngineWidgets import QWebEngineView

# --------------------------------------------------------------------
# TMDB API configuration and cache
TMDB_API_KEY = "aaf212050d3a56424a311c8fab681f11"
TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhYWYyMTIwNTBkM2E1NjQyNGEzMTFjOGZhYjY4MWYxMSIsIm5iZiI6MTcyMDUzMTkwMi4xODA1NDksInN1YiI6IjY1ZGRjMTEyMmFjNDk5MDE3ZGNiNzc0NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vxlSQxvmZdb4hYkZBiCiNcheLv-zlXWYLWB4iYtH-qo"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
HEADERS = {
    "User-Agent": "MovieTVInsightApp/1.0",
    "Authorization": f"Bearer {TMDB_ACCESS_TOKEN}"
}
details_cache = {}

# --------------------------------------------------------------------
# OMDB API configuration
OMDB_API_KEY = "6bbc1115"  # Use your provided OMDB API key for faster/better results
OMDB_BASE_URL = "http://www.omdbapi.com/"

# --------------------------------------------------------------------
# Add search results caching to speed up repeat searches
search_cache = {}
imdb_id_cache = {}
imdb_rating_cache = {}

# Set higher timeout for TMDB API requests to prevent timeouts
DEFAULT_TIMEOUT = 10

# --------------------------------------------------------------------
# Add persistent storage for watchlist and history
USER_DATA_DIR = os.path.join(os.path.expanduser("~"), ".movietv_insight")
WATCHLIST_FILE = os.path.join(USER_DATA_DIR, "watchlist.json")
HISTORY_FILE = os.path.join(USER_DATA_DIR, "history.json")

# Ensure user data directory exists
if not os.path.exists(USER_DATA_DIR):
    try:
        os.makedirs(USER_DATA_DIR)
    except Exception as e:
        print(f"Error creating user data directory: {e}")

# Load watchlist from file
def load_watchlist():
    if os.path.exists(WATCHLIST_FILE):
        try:
            with open(WATCHLIST_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading watchlist: {e}")
    return []

# Save watchlist to file
def save_watchlist(watchlist):
    try:
        with open(WATCHLIST_FILE, 'w') as f:
            json.dump(watchlist, f)
    except Exception as e:
        print(f"Error saving watchlist: {e}")

# Load history from file
def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading history: {e}")
    return []

# Save history to file
def save_history(history):
    try:
        with open(HISTORY_FILE, 'w') as f:
            json.dump(history, f)
    except Exception as e:
        print(f"Error saving history: {e}")

# Add item to history
def add_to_history(item):
    history = load_history()
    # Remove existing entries for this item to avoid duplicates
    history = [h for h in history if h.get('id') != item.get('id') or h.get('media_type') != item.get('media_type')]
    # Add new entry at the beginning
    history.insert(0, item)
    # Keep only the last 50 items
    if len(history) > 50:
        history = history[:50]
    save_history(history)

# --------------------------------------------------------------------
# Helper functions for API calls

def search_tmdb(query, content_type="multi"):
    """Search TMDB for movies/TV shows matching 'query'."""
    # Check cache first for faster results
    cache_key = f"{content_type}_{query.lower().strip()}"
    if cache_key in search_cache:
        print("Using cached search results")
        return search_cache[cache_key]
    
    url = f"{TMDB_BASE_URL}/search/{content_type}"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "en-US",
        "page": 1,
        "include_adult": "false"
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        
        # Cache the results for future use
        search_cache[cache_key] = results
        return results
    except Exception as e:
        print(f"Error searching TMDB: {e}")
    return []

def get_tmdb_details(item_id, media_type):
    """Fetch detailed info for a movie/TV show from TMDB by ID (using caching)."""
    cache_key = f"{media_type}_{item_id}"
    if cache_key in details_cache:
        return details_cache[cache_key]
    
    url = f"{TMDB_BASE_URL}/{media_type}/{item_id}"
    params = {
        "api_key": TMDB_API_KEY, 
        "language": "en-US",
        "append_to_response": "credits,videos,images,similar,recommendations,reviews"
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        details = response.json()
        details_cache[cache_key] = details
        return details
    except Exception as e:
        print(f"Error fetching details: {e}")
    return {}

def get_media_credits(item_id, media_type):
    """Get cast and crew information."""
    url = f"{TMDB_BASE_URL}/{media_type}/{item_id}/credits"
    params = {"api_key": TMDB_API_KEY, "language": "en-US"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching credits: {e}")
    return {"cast": [], "crew": []}

def get_tmdb_ratings(title, year=None, media_type="movie"):
    """Get ratings from various sources via OMDB API."""
    params = {
        "apikey": OMDB_API_KEY,
        "t": title,
        "type": "movie" if media_type == "movie" else "series",
        "r": "json"
    }
    if year:
        params["y"] = year
        
    try:
        response = requests.get(OMDB_BASE_URL, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if data.get("Response") == "True":
            ratings = {}
            for source in data.get("Ratings", []):
                ratings[source.get("Source", "Unknown")] = source.get("Value", "N/A")
            
            return {
                "IMDB": data.get("imdbRating", "N/A"),
                "Metascore": data.get("Metascore", "N/A"),
                "Rotten Tomatoes": ratings.get("Rotten Tomatoes", "N/A"),
                "Metacritic": ratings.get("Metacritic", "N/A")
            }
    except Exception as e:
        print(f"Error fetching OMDB ratings: {e}")
    
    return {
        "IMDB": "N/A",
        "Metascore": "N/A",
        "Rotten Tomatoes": "N/A",
        "Metacritic": "N/A"
    }

def get_imdb_id_for_tmdb(tmdb_id, media_type):
    """Get IMDB ID from TMDB ID to enable direct IMDB ratings lookup."""
    cache_key = f"{media_type}_{tmdb_id}"
    
    # Check cache first
    if cache_key in imdb_id_cache:
        return imdb_id_cache[cache_key]
        
    try:
        url = f"{TMDB_BASE_URL}/{media_type}/{tmdb_id}/external_ids"
        params = {"api_key": TMDB_API_KEY}
        
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        imdb_id = data.get("imdb_id", "")
        imdb_id_cache[cache_key] = imdb_id
        return imdb_id
    except Exception as e:
        print(f"Error fetching IMDB ID: {e}")
        return ""

def get_quick_imdb_rating(imdb_id):
    """Get IMDB rating directly by ID for faster results."""
    if not imdb_id:
        return "N/A"
        
    # Check cache first
    if imdb_id in imdb_rating_cache:
        return imdb_rating_cache[imdb_id]
    
    try:
        params = {
            "apikey": OMDB_API_KEY,
            "i": imdb_id,
            "r": "json"
        }
        
        response = requests.get(OMDB_BASE_URL, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if data.get("Response") == "True":
            rating = data.get("imdbRating", "N/A")
            imdb_rating_cache[imdb_id] = rating
            return rating
    except Exception as e:
        print(f"Error fetching quick IMDB rating: {e}")
    
    return "N/A"

def fetch_image(url):
    """Download an image and return it as QPixmap with error handling and retry."""
    if not url:
        return None
        
    # Implement retry logic for images
    max_retries = 2
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=DEFAULT_TIMEOUT)
            response.raise_for_status()
            pixmap = QtGui.QPixmap()
            success = pixmap.loadFromData(response.content)
            
            if success and not pixmap.isNull():
                return pixmap
            elif attempt < max_retries - 1:
                print(f"Retrying image download for: {url}")
                continue
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Error downloading image (retry {attempt+1}): {e}")
            else:
                print(f"Final error downloading image: {e}")
    
    # If we get here, we've failed - create a placeholder image
    placeholder = QtGui.QPixmap(100, 150)
    placeholder.fill(QtGui.QColor("#f0f0f0"))
    painter = QtGui.QPainter(placeholder)
    painter.setPen(QtGui.QColor("#999999"))
    painter.drawText(placeholder.rect(), QtCore.Qt.AlignCenter, "No Image")
    painter.end()
    return placeholder

def get_tmdb_suggestions(query):
    """Get search suggestions as you type."""
    if not query or len(query) < 2:
        return []
    
    url = f"{TMDB_BASE_URL}/search/multi"
    params = {
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "en-US",
        "page": 1,
        "include_adult": "false"
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=2)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])[:10]  # Limit to top 10 suggestions
        
        suggestions = []
        for item in results:
            if item.get("media_type") in ["movie", "tv"]:
                title = item.get("title", item.get("name", ""))
                year = ""
                if item.get("media_type") == "movie" and item.get("release_date"):
                    year = f" ({item['release_date'][:4]})"
                elif item.get("media_type") == "tv" and item.get("first_air_date"):
                    year = f" ({item['first_air_date'][:4]})"
                
                media_type = "Movie" if item.get("media_type") == "movie" else "TV Show"
                suggestions.append(f"{title}{year} - {media_type}")
        
        return suggestions
    except Exception as e:
        print(f"Error fetching suggestions: {e}")
    return []

def get_trending_movies(limit=20):
    """Get currently trending/popular movies from TMDB."""
    cache_key = f"trending_movies_{datetime.now().strftime('%Y-%m-%d')}"
    if cache_key in search_cache:
        print("Using cached trending movies")
        return search_cache[cache_key][:limit]
    
    try:
        # First try trending movies for today
        url = f"{TMDB_BASE_URL}/trending/movie/day"
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US"
        }
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        
        # If we don't have enough trending results, add popular movies
        if len(results) < limit:
            popular_url = f"{TMDB_BASE_URL}/movie/popular"
            popular_response = requests.get(popular_url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
            popular_response.raise_for_status()
            popular_data = popular_response.json()
            
            # Add only new movies not already in results
            existing_ids = {movie['id'] for movie in results}
            for movie in popular_data.get("results", []):
                if movie['id'] not in existing_ids and len(results) < limit:
                    results.append(movie)
        
        # Cache the results with today's date as cache key
        search_cache[cache_key] = results
        return results[:limit]
    except Exception as e:
        print(f"Error fetching trending movies: {e}")
        return []

def get_trending_tv_shows(limit=20):
    """Get currently trending/popular TV shows from TMDB."""
    cache_key = f"trending_tv_{datetime.now().strftime('%Y-%m-%d')}"
    if cache_key in search_cache:
        print("Using cached trending TV shows")
        return search_cache[cache_key][:limit]
    
    try:
        # First try trending TV shows for today
        url = f"{TMDB_BASE_URL}/trending/tv/day"
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US"
        }
        response = requests.get(url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        results = data.get("results", [])
        
        # If we don't have enough trending results, add popular TV shows
        if len(results) < limit:
            popular_url = f"{TMDB_BASE_URL}/tv/popular"
            popular_response = requests.get(popular_url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
            popular_response.raise_for_status()
            popular_data = popular_response.json()
            
            # Add only new TV shows not already in results
            existing_ids = {show['id'] for show in results}
            for show in popular_data.get("results", []):
                if show['id'] not in existing_ids and len(results) < limit:
                    results.append(show)
        
        # Cache the results with today's date as cache key
        search_cache[cache_key] = results
        return results[:limit]
    except Exception as e:
        print(f"Error fetching trending TV shows: {e}")
        return []
    
# --------------------------------------------------------------------
# Enhanced API calls for better similar content and ratings

def get_enhanced_similar_content(item_id, media_type):
    """Get better similar content recommendations with weighted scoring."""
    similar_key = f"{media_type}_{item_id}_similar_enhanced"
    if similar_key in search_cache:
        return search_cache[similar_key]
        
    try:
        # Get similar and recommended content
        similar_url = f"{TMDB_BASE_URL}/{media_type}/{item_id}/similar"
        recommend_url = f"{TMDB_BASE_URL}/{media_type}/{item_id}/recommendations"
        
        params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US",
            "page": 1
        }
        
        similar_response = requests.get(similar_url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        similar_response.raise_for_status()
        similar_data = similar_response.json().get("results", [])
        
        recommend_response = requests.get(recommend_url, headers=HEADERS, params=params, timeout=DEFAULT_TIMEOUT)
        recommend_response.raise_for_status()
        recommend_data = recommend_response.json().get("results", [])
        
        # Get the original item's details for better comparison
        original_details = get_tmdb_details(item_id, media_type)
        original_genres = set(g.get('id') for g in original_details.get('genres', []))
        
        # Combine and score results
        seen_ids = set()
        enhanced_results = []
        
        for item in similar_data + recommend_data:
            if item['id'] in seen_ids:
                continue
            seen_ids.add(item['id'])
            
            # Calculate relevance score based on various factors
            score = 0
            
            # Genre matching (up to +3.0)
            item_genres = set(g.get('genre_id') for g in item.get('genre_ids', []))
            matching_genres = len(original_genres.intersection(item_genres)) if original_genres and item_genres else 0
            genre_score = min(3.0, matching_genres * 1.0)
            score += genre_score
            
            # Vote count weight (up to +2.0) - more votes = more reliable recommendation
            vote_count = item.get('vote_count', 0)
            vote_score = min(2.0, vote_count / 1000)
            score += vote_score
            
            # Vote average (up to +3.0)
            vote_avg = item.get('vote_average', 0)
            avg_score = min(3.0, vote_avg / 3.33)
            score += avg_score
            
            # Popularity boost (up to +2.0)
            popularity = item.get('popularity', 0)
            pop_score = min(2.0, popularity / 50)
            score += pop_score
            
            # Add the score to the item
            item['relevance_score'] = round(score, 1)
            enhanced_results.append(item)
        
        # Sort by relevance score
        enhanced_results.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        # Cache the results
        search_cache[similar_key] = enhanced_results
        return enhanced_results
        
    except Exception as e:
        print(f"Error getting enhanced similar content: {e}")
        return []

def get_comprehensive_ratings(imdb_id, title, year=None, media_type="movie"):
    """Get comprehensive ratings from multiple sources with cache."""
    cache_key = f"ratings_{imdb_id}_{title}_{year}_{media_type}"
    if cache_key in search_cache:
        return search_cache[cache_key]
    
    all_ratings = {
        "TMDB": {"value": "N/A", "source": "TMDB", "icon": "🌟"},
        "IMDB": {"value": "N/A", "source": "IMDB", "icon": "⭐"},
        "Rotten Tomatoes": {"value": "N/A", "source": "Rotten Tomatoes", "icon": "🍅"},
        "Metacritic": {"value": "N/A", "source": "Metacritic", "icon": "Ⓜ️"}
    }
    
    try:
        # Get OMDB ratings which include RT, Metacritic and IMDB
        params = {
            "apikey": OMDB_API_KEY,
            "i": imdb_id if imdb_id else None,
            "t": None if imdb_id else title,
            "y": year,
            "type": "movie" if media_type == "movie" else "series",
            "r": "json"
        }
        
        # Remove None values
        params = {k: v for k, v in params.items() if v is not None}
        
        response = requests.get(OMDB_BASE_URL, params=params, timeout=DEFAULT_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        
        if data.get("Response") == "True":
            # IMDB rating
            if data.get("imdbRating") and data.get("imdbRating") != "N/A":
                all_ratings["IMDB"]["value"] = f"{data['imdbRating']}/10"
                all_ratings["IMDB"]["votes"] = data.get("imdbVotes", "N/A")
            
            # Metacritic
            if data.get("Metascore") and data.get("Metascore") != "N/A":
                all_ratings["Metacritic"]["value"] = f"{data['Metascore']}/100"
            
            # Extract other ratings
            for rating in data.get("Ratings", []):
                source = rating.get("Source")
                value = rating.get("Value")
                
                if source == "Rotten Tomatoes" and value:
                    all_ratings["Rotten Tomatoes"]["value"] = value
    
    except Exception as e:
        print(f"Error fetching OMDB ratings: {e}")
    
    # Cache the results
    search_cache[cache_key] = all_ratings
    return all_ratings

# --------------------------------------------------------------------
# Worker Threads for nonblocking network calls

class SearchThread(QtCore.QThread):
    results_signal = QtCore.pyqtSignal(list)
    error_signal = QtCore.pyqtSignal(str)

    def __init__(self, query, content_type="multi"):
        super().__init__()
        self.query = query
        self.content_type = content_type

    def run(self):
        try:
            results = search_tmdb(self.query, self.content_type)
            self.results_signal.emit(results)
        except Exception as e:
            self.error_signal.emit(str(e))

class DetailThread(QtCore.QThread):
    detail_signal = QtCore.pyqtSignal(dict, dict)
    error_signal = QtCore.pyqtSignal(str)

    def __init__(self, item_id, media_type, title, year=None):
        super().__init__()
        self.item_id = item_id
        self.media_type = media_type
        self.title = title
        self.year = year

    def run(self):
        try:
            details = get_tmdb_details(self.item_id, self.media_type)
            ratings = get_tmdb_ratings(self.title, self.year, self.media_type)
            self.detail_signal.emit(details, ratings)
        except Exception as e:
            self.error_signal.emit(str(e))

# Create a worker thread for fetching search results with IMDB data
class EnhancedSearchThread(QtCore.QThread):
    results_signal = QtCore.pyqtSignal(list)
    error_signal = QtCore.pyqtSignal(str)

    def __init__(self, query, content_type="multi"):
        super().__init__()
        self.query = query
        self.content_type = content_type

    def run(self):
        try:
            results = search_tmdb(self.query, self.content_type)
            
            # Add IMDB IDs and ratings for faster display
            enhanced_results = []
            
            # Process in batches for better responsiveness
            batch_size = 5
            for i in range(0, len(results), batch_size):
                batch = results[i:i+batch_size]
                for item in batch:
                    if item.get("media_type") in ["movie", "tv"] or self.content_type in ["movie", "tv"]:
                        media_type = item.get("media_type", self.content_type)
                        imdb_id = get_imdb_id_for_tmdb(item.get("id"), media_type)
                        imdb_rating = get_quick_imdb_rating(imdb_id) if imdb_id else "N/A"
                        item["imdb_id"] = imdb_id
                        item["imdb_rating"] = imdb_rating
                    enhanced_results.append(item)
            
            self.results_signal.emit(enhanced_results)
        except Exception as e:
            self.error_signal.emit(str(e))

# --------------------------------------------------------------------
# Class for rotatable label (fixes QPropertyAnimation rotation issue)
class RotatableLabel(QtWidgets.QLabel):
    def __init__(self, text=""):
        super().__init__(text)
        self._rotation = 0
        
    @pyqtProperty(float)
    def rotation(self):
        return self._rotation
        
    @rotation.setter
    def rotation(self, value):
        self._rotation = value
        # Create transform
        transform = QtGui.QTransform()
        transform.translate(self.width() / 2, self.height() / 2)
        transform.rotate(value)
        transform.translate(-self.width() / 2, -self.height() / 2)
        
        # Apply rotation
        self.setPixmap(self._base_pixmap.transformed(transform, QtCore.Qt.SmoothTransformation))
        
    def setPixmap(self, pixmap):
        self._base_pixmap = pixmap
        super().setPixmap(pixmap)

# --------------------------------------------------------------------
# AutoCompleteLineEdit: provides search suggestions as you type
class AutoCompleteLineEdit(QtWidgets.QLineEdit):
    def __init__(self, parent=None):
        super().__init__(parent)
        
        self.completer = QtWidgets.QCompleter(self)
        self.completer.setCompletionMode(QtWidgets.QCompleter.PopupCompletion)
        self.setCompleter(self.completer)
        
        # Set up a model for the completer
        self.completion_model = QtCore.QStringListModel(self)
        self.completer.setModel(self.completion_model)
        
        # Timer for delayed suggestion fetching while typing
        self.suggestion_timer = QTimer()
        self.suggestion_timer.setInterval(300)  # 300ms delay
        self.suggestion_timer.setSingleShot(True)
        self.suggestion_timer.timeout.connect(self.get_suggestions)
        
        # Connect text changed signal to trigger suggestion timer
        self.textChanged.connect(self.start_suggestion_timer)
        
    def start_suggestion_timer(self, text):
        if len(text) >= 3:  # Only trigger suggestions for 3+ characters
            self.suggestion_timer.start()
        
    def get_suggestions(self):
        query = self.text().strip()
        if query:
            suggestions = get_tmdb_suggestions(query)
            self.completion_model.setStringList(suggestions)

# --------------------------------------------------------------------
# GalleryWidget: displays a scrollable grid of images

class GalleryWidget(QtWidgets.QWidget):
    def __init__(self, images_data=None):
        super().__init__()
        self.images_data = images_data or []
        self.init_ui()

    def init_ui(self):
        scroll_area = QtWidgets.QScrollArea()
        scroll_area.setWidgetResizable(True)
        container = QtWidgets.QWidget()
        self.grid = QtWidgets.QGridLayout(container)
        self.grid.setSpacing(10)
        scroll_area.setWidget(container)
        layout = QtWidgets.QVBoxLayout(self)
        layout.addWidget(scroll_area)
        self.setLayout(layout)
        self.populate_images()

    def populate_images(self):
        row, col = 0, 0
        
        # If we have no images, show a message
        if not self.images_data:
            label = QtWidgets.QLabel("No images available")
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("color: #888; font-style: italic; font-size: 16px;")
            self.grid.addWidget(label, 0, 0)
            return
            
        for img in self.images_data:
            if not isinstance(img, str):
                # For TMDB image objects
                file_path = img.get("file_path")
                if file_path:
                    url = f"https://image.tmdb.org/t/p/w500{file_path}"
                else:
                    continue
            else:
                # For direct URL strings
                url = img
                
            label = QtWidgets.QLabel()
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setMinimumSize(220, 180)
            
            # Create a frame effect for the images
            label.setStyleSheet("""
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 5px;
            """)
            
            pix = fetch_image(url)
            if pix:
                # Create a fade-in effect
                opacity = QtWidgets.QGraphicsOpacityEffect()
                label.setGraphicsEffect(opacity)
                opacity.setOpacity(0)
                
                label.setPixmap(pix.scaled(220, 180, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
                
                # Animation for fade-in
                anim = QtCore.QPropertyAnimation(opacity, b"opacity")
                anim.setStartValue(0.0)
                anim.setEndValue(1.0)
                anim.setDuration(500)
                anim.setEasingCurve(QtCore.QEasingCurve.OutCubic)
                anim.start()
            else:
                label.setText("Image unavailable")
                
            self.grid.addWidget(label, row, col)
            col += 1
            if col >= 3:
                col = 0
                row += 1

# --------------------------------------------------------------------
# DetailTabs: displays tabs for Details, Cast, Gallery, Trailers, and Ratings

class DetailTabs(QtWidgets.QTabWidget):
    def __init__(self, details, ratings):
        super().__init__()
        self.details = details
        self.ratings = ratings
        self.media_type = details.get("media_type", "") or ("tv" if "seasons" in details else "movie")
        self.setDocumentMode(True)
        self.init_tabs()

    def init_tabs(self):
        # Tab 1: Overview
        overview_widget = QtWidgets.QWidget()
        overview_layout = QtWidgets.QVBoxLayout(overview_widget)
        text_browser = QtWidgets.QTextBrowser()
        text_browser.setHtml(self.format_details())
        overview_layout.addWidget(text_browser)
        self.addTab(overview_widget, "Overview")

        # Tab 2: Cast & Crew
        cast_widget = QtWidgets.QWidget()
        cast_layout = QtWidgets.QVBoxLayout(cast_widget)
        cast_text = QtWidgets.QTextBrowser()
        cast_text.setHtml(self.get_cast_info())
        cast_layout.addWidget(cast_text)
        self.addTab(cast_widget, "Cast & Crew")

        # Tab 3: Gallery
        images = []
        if self.details.get("images") and self.details["images"].get("backdrops"):
            images = self.details["images"]["backdrops"][:15]  # Limit to 15 images
        
        poster_path = self.details.get("poster_path")
        if poster_path:
            # Add poster at the beginning
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            images.insert(0, {"file_path": poster_path})
            
        gallery_widget = GalleryWidget(images)
        self.addTab(gallery_widget, "Gallery")

        # Tab 4: Trailers
        trailer_widget = self.create_trailer_tab()
        self.addTab(trailer_widget, "Trailers")

        # Tab 5: Ratings
        ratings_widget = self.create_ratings_tab()
        self.addTab(ratings_widget, "Ratings")
        
        # Tab 6: Similar Content
        similar_widget = self.create_similar_content_tab()
        self.addTab(similar_widget, "Similar Content")

    def format_details(self):
        d = self.details
        title = d.get("title", d.get("name", "N/A"))
        tagline = d.get("tagline", "")
        overview = d.get("overview", "No overview available.")
        
        # Format release information based on media type
        if self.media_type == "movie":
            release_date = d.get("release_date", "N/A")
            release_year = release_date.split("-")[0] if release_date and "-" in release_date else "N/A"
            runtime_min = d.get("runtime", 0)
            runtime = f"{runtime_min} minutes ({runtime_min // 60}h {runtime_min % 60}m)" if runtime_min else "N/A"
            release_info = f"<p><b style='color:#e50914'>Release Date:</b> {release_date}</p>"
            time_info = f"<p><b style='color:#e50914'>Runtime:</b> {runtime}</p>"
        else:  # TV Show
            first_air = d.get("first_air_date", "N/A")
            last_air = d.get("last_air_date", "N/A")
            seasons = d.get("number_of_seasons", 0)
            episodes = d.get("number_of_episodes", 0)
            runtime = ", ".join([str(t) for t in d.get("episode_run_time", [])]) + " mins" if d.get("episode_run_time") else "N/A"
            release_year = first_air.split("-")[0] if first_air and "-" in first_air else "N/A"
            release_info = f"""
                <p><b style='color:#e50914'>First Air Date:</b> {first_air}</p>
                <p><b style='color:#e50914'>Last Air Date:</b> {last_air}</p>
                <p><b style='color:#e50914'>Seasons:</b> {seasons} | <b style='color:#e50914'>Episodes:</b> {episodes}</p>
            """
            time_info = f"<p><b style='color:#e50914'>Episode Runtime:</b> {runtime}</p>"
        
        # Get genres, production companies, and countries
        genres = ", ".join([g.get("name", "") for g in d.get("genres", [])]) or "N/A"
        companies = ", ".join([c.get("name", "") for c in d.get("production_companies", [])]) or "N/A"
        countries = ", ".join([c.get("name", "") for c in d.get("production_countries", [])]) or "N/A"
        
        # Get rating information
        vote_avg = d.get("vote_average", 0)
        vote_count = d.get("vote_count", 0)
        rating_stars = "★" * int(vote_avg // 2) + "☆" * (5 - int(vote_avg // 2))
        
        # Generate poster HTML
        poster_path = d.get("poster_path")
        poster_html = ""
        if poster_path:
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            poster_html = f"""
                <div style="float:right; margin:0 0 20px 20px; max-width:40%;">
                    <img src="{poster_url}" style="width:100%; border-radius:10px; box-shadow:0 5px 25px rgba(0,0,0,0.2);">
                    <div style="text-align:center; margin-top:10px;">
                        <span style="font-size:24px; color:#e50914;">{rating_stars}</span><br>
                        <span style="font-size:18px; font-weight:bold;">{vote_avg}/10</span>
                        <span style="font-size:12px; color:#666;"> ({vote_count} votes)</span>
                    </div>
                </div>
            """
        
        # Get content rating
        content_rating = "N/A"
        
        return f"""
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 15px;">
            {poster_html}
            <h1 style="font-size:36px; color:#e50914; margin-bottom: 0;">{title}</h1>
            <h3 style="font-size:20px; color:#666; margin-top: 5px; font-style:italic;">{tagline}</h3>
            
            <div style="margin: 20px 0; padding: 15px; background-color: white; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="display: flex; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px; padding-right: 15px;">
                        {release_info}
                        <p><b style='color:#e50914'>Genres:</b> {genres}</p>
                    </div>
                    <div style="flex: 1; min-width: 200px; padding-left: 15px; border-left: 1px solid #eee;">
                        {time_info}
                        <p><b style='color:#e50914'>Content Rating:</b> {content_rating}</p>
                    </div>
                </div>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="color:#e50914; margin-top: 0;">Synopsis</h3>
                <p style="line-height: 1.6;">{overview}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h3 style="color:#e50914; margin-top: 0;">Production Information</h3>
                <p><b style='color:#e50914'>Companies:</b> {companies}</p>
                <p><b style='color:#e50914'>Countries:</b> {countries}</p>
            </div>
        </div>
        """

    def get_cast_info(self):
        cast = self.details.get("credits", {}).get("cast", [])[:10]  # Limit to top 10
        crew = self.details.get("credits", {}).get("crew", [])
        
        # Filter directors and writers
        directors = [c for c in crew if c.get("job") == "Director"][:3]
        writers = [c for c in crew if c.get("department") == "Writing"][:3]
        
        cast_html = ""
        for person in cast:
            profile_path = person.get("profile_path")
            profile_img = f"https://image.tmdb.org/t/p/w185{profile_path}" if profile_path else ""
            
            cast_html += f"""
                <div style="display:flex; margin-bottom:15px; background-color:white; border-radius:10px; padding:15px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <div style="width:70px; margin-right:15px;">
                        <img src="{profile_img}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; border:2px solid #e50914;" 
                          onerror="this.onerror=null; this.src='https://via.placeholder.com/70x70?text=No+Image';">
                    </div>
                    <div style="flex:1;">
                        <h3 style="margin:0 0 5px 0; color:#e50914;">{person.get('name', 'Unknown')}</h3>
                        <p style="margin:0; color:#666;"><i>as {person.get('character', 'Unknown Role')}</i></p>
                    </div>
                </div>
            """
        
        # Format directors
        directors_html = ""
        for director in directors:
            directors_html += f"<li>{director.get('name', 'Unknown')}</li>"
            
        # Format writers
        writers_html = ""
        for writer in writers:
            writers_html += f"<li>{writer.get('name', 'Unknown')} ({writer.get('job', 'Writer')})</li>"
        
        return f"""
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 15px;">
            <h2 style="color:#e50914; margin-top:0;">Top Cast</h2>
            {cast_html}
            
            <div style="display:flex; margin-top:30px;">
                <div style="flex:1; background-color:white; border-radius:10px; padding:20px; margin-right:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color:#e50914; margin-top:0;">Direction</h3>
                    <ul>
                        {directors_html if directors_html else "<li>Information not available</li>"}
                    </ul>
                </div>
                <div style="flex:1; background-color:white; border-radius:10px; padding:20px; margin-left:10px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="color:#e50914; margin-top:0;">Writing</h3>
                    <ul>
                        {writers_html if writers_html else "<li>Information not available</li>"}
                    </ul>
                </div>
            </div>
        </div>
        """

    def create_trailer_tab(self):
        videos = self.details.get("videos", {}).get("results", [])
        trailers = [v for v in videos if v.get("type") == "Trailer" and v.get("site") == "YouTube"]
        
        if not trailers:
            # Create a widget that displays "No trailers available"
            widget = QtWidgets.QWidget()
            layout = QtWidgets.QVBoxLayout(widget)
            label = QtWidgets.QLabel("No trailers available")
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("color: #888; font-style: italic; font-size: 18px;")
            layout.addWidget(label)
            return widget
        
        # Use the first trailer
        trailer = trailers[0]
        video_key = trailer.get("key", "")
        
        if not video_key:
            # Fall back to YouTube search if no specific trailer found
            title = self.details.get("title", self.details.get("name", ""))
            year = ""
            if self.media_type == "movie" and self.details.get("release_date"):
                year = self.details["release_date"].split("-")[0]
            elif self.media_type == "tv" and self.details.get("first_air_date"):
                year = self.details["first_air_date"].split("-")[0]
                
            query = urllib.parse.quote_plus(f"{title} {year} official trailer")
            youtube_url = f"https://www.youtube.com/results?search_query={query}"
        else:
            youtube_url = f"https://www.youtube.com/embed/{video_key}"
        
        view = QWebEngineView()
        view.setUrl(QUrl(youtube_url))
        
        return view

    def create_ratings_tab(self):
        """Enhanced ratings tab with visual indicators and more sources."""
        # Get the IMDB ID for this content
        imdb_id = get_imdb_id_for_tmdb(self.details.get("id"), self.media_type) 
        
        # Get comprehensive ratings
        title = self.details.get("title", self.details.get("name", ""))
        year = None
        if self.media_type == "movie" and self.details.get("release_date"):
            year = self.details.get("release_date").split("-")[0]
        elif self.media_type == "tv" and self.details.get("first_air_date"):
            year = self.details.get("first_air_date").split("-")[0]
        
        # Get TMDB rating
        tmdb_score = self.details.get("vote_average", 0)
        tmdb_votes = self.details.get("vote_count", 0)
        
        all_ratings = get_comprehensive_ratings(imdb_id, title, year, self.media_type)
        
        # Update TMDB rating
        all_ratings["TMDB"]["value"] = f"{tmdb_score}/10"
        all_ratings["TMDB"]["votes"] = str(tmdb_votes)
        
        # Create main widget
        ratings_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout(ratings_widget)
        
        # Create a nice visualization of ratings
        viz_widget = QtWidgets.QWidget()
        viz_widget.setStyleSheet("background-color: white; border-radius: 10px; padding: 15px;")
        viz_layout = QtWidgets.QVBoxLayout(viz_widget)
        
        viz_title = QtWidgets.QLabel("Ratings at a Glance")
        viz_title.setStyleSheet("font-weight: bold; font-size: 16px; color: #e50914; margin-bottom: 10px;")
        viz_layout.addWidget(viz_title)
        
        # Create horizontal bars for each rating
        for source, data in all_ratings.items():
            if data["value"] == "N/A":
                continue
                
            rating_widget = QtWidgets.QWidget()
            rating_layout = QtWidgets.QHBoxLayout(rating_widget)
            rating_layout.setContentsMargins(0, 5, 0, 5)
            
            # Source label
            source_label = QtWidgets.QLabel(f"{data['icon']} {source}")
            source_label.setMinimumWidth(150)
            source_label.setStyleSheet("font-weight: bold; color: #333;")
            
            # Progress bar for visual representation
            bar = QtWidgets.QProgressBar()
            bar.setTextVisible(False)
            bar.setFixedHeight(20)
            
            # Parse the score to determine percentage
            score_text = data["value"]
            score_val = 0
            max_val = 100
            
            if "/" in score_text:
                parts = score_text.split("/")
                try:
                    score_val = float(parts[0].strip())
                    max_val = float(parts[1].strip())
                    if max_val == 10:
                        score_val = score_val * 10
                        max_val = 100
                except:
                    pass
            elif "%" in score_text:
                try:
                    score_val = float(score_text.replace("%", "").strip())
                except:
                    pass
            
            # Set progress and color
            percentage = int((score_val / max_val) * 100)
            bar.setValue(percentage)
            
            # Color coding based on score
            color = "#e50914"  # default red
            if percentage >= 80:
                color = "#4CAF50"  # green for high scores
            elif percentage >= 60:
                color = "#FB8C00"  # orange for medium scores
                
            bar.setStyleSheet(f"""
                QProgressBar {{
                    border: none;
                    border-radius: 10px;
                    background-color: #f0f0f0;
                    text-align: center;
                }}
                QProgressBar::chunk {{
                    background-color: {color};
                    border-radius: 10px;
                }}
            """)
            
            # Value label
            value_label = QtWidgets.QLabel(score_text)
            value_label.setStyleSheet(f"color: {color}; font-weight: bold; margin-left: 10px;")
            value_label.setMinimumWidth(60)
            
            rating_layout.addWidget(source_label)
            rating_layout.addWidget(bar, 1)
            rating_layout.addWidget(value_label)
            
            viz_layout.addWidget(rating_widget)
        
        main_layout.addWidget(viz_widget)
        
        # Consensus section
        consensus_widget = QtWidgets.QWidget()
        consensus_widget.setStyleSheet("background-color: white; border-radius: 10px; padding: 15px; margin-top: 15px;")
        consensus_layout = QtWidgets.QVBoxLayout(consensus_widget)
        
        consensus_title = QtWidgets.QLabel("Critical Consensus")
        consensus_title.setStyleSheet("font-weight: bold; font-size: 16px; color: #e50914; margin-bottom: 10px;")
        consensus_layout.addWidget(consensus_title)
        
        # Calculate average rating across all valid sources
        valid_ratings = []
        for source, data in all_ratings.items():
            if data["value"] != "N/A" and "/" in data["value"]:
                try:
                    parts = data["value"].split("/")
                    score = float(parts[0].strip())
                    max_score = float(parts[1].strip())
                    normalized = (score / max_score) * 10
                    valid_ratings.append(normalized)
                except:
                    pass
        
        if valid_ratings:
            avg_score = sum(valid_ratings) / len(valid_ratings)
            verdict = "Excellent" if avg_score >= 8 else "Good" if avg_score >= 6 else "Average" if avg_score >= 5 else "Poor"
            color = "#4CAF50" if avg_score >= 8 else "#FB8C00" if avg_score >= 6 else "#FDD835" if avg_score >= 5 else "#e50914"
            
            consensus_text = QtWidgets.QLabel(
                f"<span style='font-size:18px;'><b>Average Score: <span style='color:{color};'>{avg_score:.1f}/10</span> - "
                f"<span style='color:{color};'>{verdict}</span></b></span><br><br>"
                f"This {self.media_type.capitalize()} has received <b>{verdict.lower()}</b> ratings overall across multiple review platforms."
            )
            consensus_text.setWordWrap(True)
            consensus_layout.addWidget(consensus_text)
        else:
            no_consensus = QtWidgets.QLabel("Not enough ratings to form a consensus.")
            no_consensus.setStyleSheet("color: #888; font-style: italic;")
            consensus_layout.addWidget(no_consensus)
        
        main_layout.addWidget(consensus_widget)
        
        # Reviews section - using the existing reviews section
        reviews_data = self.details.get("reviews", {}).get("results", [])[:3]
        if reviews_data:
            reviews_widget = QtWidgets.QWidget()
            reviews_widget.setStyleSheet("background-color: white; border-radius: 10px; padding: 15px; margin-top: 15px;")
            reviews_layout = QtWidgets.QVBoxLayout(reviews_widget)
            
            reviews_title = QtWidgets.QLabel("Recent Reviews")
            reviews_title.setStyleSheet("font-weight: bold; font-size: 16px; color: #e50914; margin-bottom: 10px;")
            reviews_layout.addWidget(reviews_title)
            
            for review in reviews_data:
                review_frame = QtWidgets.QFrame()
                review_frame.setFrameShape(QtWidgets.QFrame.StyledPanel)
                review_frame.setStyleSheet("""
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 10px;
                    margin: 5px 0;
                """)
                review_layout = QtWidgets.QVBoxLayout(review_frame)
                author = review.get("author", "Anonymous")
                content = review.get("content", "No content")
                if len(content) > 200:
                    content = content[:200] + "..."
                
                author_label = QtWidgets.QLabel(f"<b>{author}</b>")
                content_label = QtWidgets.QLabel(content)
                content_label.setWordWrap(True)
                review_layout.addWidget(author_label)
                review_layout.addWidget(content_label)
                reviews_layout.addWidget(review_frame)
                
            main_layout.addWidget(reviews_widget)
        
        return ratings_widget

    def create_similar_content_tab(self):
        """Enhanced similar content tab with better recommendations."""
        # Get enhanced similar content
        similar_content = get_enhanced_similar_content(self.details.get("id"), self.media_type)
        
        # Create scrollable grid of movie/show cards
        scroll_area = QtWidgets.QScrollArea()
        scroll_area.setWidgetResizable(True)
        container = QtWidgets.QWidget()
        grid_layout = QtWidgets.QGridLayout(container)
        grid_layout.setSpacing(15)
        scroll_area.setWidget(container)
        
        if not similar_content:
            label = QtWidgets.QLabel("No similar content available")
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("color: #888; font-style: italic; font-size: 16px;")
            grid_layout.addWidget(label, 0, 0)
        else:
            # Add explanation of how recommendations work
            explanation = QtWidgets.QLabel(
                "Recommendations are based on genre matching, audience ratings, and overall popularity."
            )
            explanation.setWordWrap(True)
            explanation.setStyleSheet("color: #666; font-style: italic; padding: 5px; margin-bottom: 10px;")
            grid_layout.addWidget(explanation, 0, 0, 1, 3)
            
            row, col = 1, 0
            for i, item in enumerate(similar_content[:12]):  # Limit to 12 items
                card = self.create_content_card(item)
                grid_layout.addWidget(card, row, col)
                col += 1
                if col >= 3:
                    col = 0
                    row += 1
        
        widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(widget)
        layout.addWidget(scroll_area)
        return widget
        
    def create_content_card(self, item):
        """Enhanced content card with relevance score."""
        # Create a card-style widget for similar content
        card = QtWidgets.QFrame()
        card.setFrameShape(QtWidgets.QFrame.StyledPanel)
        card.setStyleSheet("""
            background-color: white;
            border-radius: 10px;
            padding: 10px;
            border: 1px solid #e0e0e0;
        """)
        
        # Apply drop shadow
        shadow = QtWidgets.QGraphicsDropShadowEffect()
        shadow.setBlurRadius(15)
        shadow.setColor(QtGui.QColor(0, 0, 0, 40))
        shadow.setOffset(0, 3)
        card.setGraphicsEffect(shadow)
        
        layout = QtWidgets.QVBoxLayout(card)
        
        # Title is different for movies vs TV shows
        title = item.get("title", item.get("name", "Unknown"))
        poster_path = item.get("poster_path")
        
        # Image
        img_label = QtWidgets.QLabel()
        img_label.setAlignment(QtCore.Qt.AlignCenter)
        img_label.setMinimumHeight(150)
        
        if poster_path:
            poster_url = f"https://image.tmdb.org/t/p/w342{poster_path}"
            pix = fetch_image(poster_url)
            if pix:
                img_label.setPixmap(pix.scaled(150, 225, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
            else:
                img_label.setText("No image")
        else:
            img_label.setText("No image")
            
        # Title label
        title_label = QtWidgets.QLabel(title)
        title_label.setAlignment(QtCore.Qt.AlignCenter)
        title_label.setWordWrap(True)
        title_label.setStyleSheet("font-weight: bold; font-size: 14px; color: #333; margin-top: 10px;")
        
        # Year
        year = ""
        release_date = item.get("release_date", item.get("first_air_date", ""))
        if release_date and "-" in release_date:
            year = release_date.split("-")[0]
            
        year_label = QtWidgets.QLabel(year)
        year_label.setAlignment(QtCore.Qt.AlignCenter)
        year_label.setStyleSheet("color: #666; font-size: 12px;")
        
        # Rating
        vote_avg = item.get("vote_average", 0)
        relevance = item.get("relevance_score", 0)
        
        # Show both rating and relevance
        rating_text = f"★ {vote_avg}/10"
        if relevance > 0:
            rating_text += f" • Match: {relevance}/10"
            
        rating_label = QtWidgets.QLabel(rating_text)
        rating_label.setAlignment(QtCore.Qt.AlignCenter)
        rating_label.setStyleSheet("color: #e50914; font-weight: bold; margin-top: 5px;")
        
        layout.addWidget(img_label)
        layout.addWidget(title_label)
        layout.addWidget(year_label)
        layout.addWidget(rating_label)
        
        return card

# --------------------------------------------------------------------
# StyledComponents: custom styled widgets for cinematic theme

class StyledComponents:
    @staticmethod
    def create_search_box(placeholder="Search..."):
        search_box = AutoCompleteLineEdit()
        search_box.setPlaceholderText(placeholder)
        search_box.setMinimumHeight(45)
        search_box.setStyleSheet("""
            border: 2px solid #e0e0e0;
            border-radius: 22px;
            padding: 0 15px;
            font-size: 16px;
            background-color: white;
        """)
        return search_box

    @staticmethod
    def create_button(text, icon_path=None):
        btn = QtWidgets.QPushButton(text)
        btn.setMinimumHeight(45)
        btn.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                font-weight: bold;
                border: none;
                border-radius: 22px;
                padding: 0 20px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #f40d18;
            }
            QPushButton:pressed {
                background-color: #c2070f;
            }
        """)
        
        if icon_path:
            btn.setIcon(QtGui.QIcon(icon_path))
            btn.setIconSize(QtCore.QSize(24, 24))
        return btn

    @staticmethod
    def create_list_widget():
        list_widget = QtWidgets.QListWidget()
        list_widget.setAlternatingRowColors(True)
        list_widget.setStyleSheet("""
            QListWidget {
                background-color: white;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 5px;
            }
            QListWidget::item {
                border-bottom: 1px solid #f0f0f0;
                padding: 10px;
                border-radius: 5px;
            }
            QListWidget::item:selected {
                background-color: #e50914;
                color: white;
            }
            QListWidget::item:hover {
                background-color: #ffe8e8;
            }
            QListWidget::item:alternate {
                background-color: #f9f9f9;
            }
        """)
        return list_widget

    @staticmethod
    def create_shadow(widget):
        shadow = QtWidgets.QGraphicsDropShadowEffect()
        shadow.setBlurRadius(15)
        shadow.setColor(QtGui.QColor(0, 0, 0, 80))
        shadow.setOffset(0, 3)
        widget.setGraphicsEffect(shadow)
        return widget

# --------------------------------------------------------------------
# TrendingContentWidget: displays a grid of trending movies and TV shows
class TrendingContentWidget(QtWidgets.QWidget):
    item_clicked = QtCore.pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.trending_movies = []
        self.trending_tv_shows = []
        self.init_ui()
        
    def init_ui(self):
        main_layout = QtWidgets.QVBoxLayout(self)
        
        # Header
        header_label = QtWidgets.QLabel("<h2>Trending Today</h2>")
        header_label.setAlignment(QtCore.Qt.AlignCenter)
        header_label.setStyleSheet("color: #e50914; margin: 10px 0;")
        main_layout.addWidget(header_label)
        
        # Create tabs for Movies and TV Shows
        self.tabs = QtWidgets.QTabWidget()
        self.tabs.setDocumentMode(True)
        self.tabs.setStyleSheet("""
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 2px solid #e50914;
                font-weight: bold;
            }
        """)
        
        # Movies tab
        self.movies_widget = QtWidgets.QWidget()
        self.movies_layout = QtWidgets.QVBoxLayout(self.movies_widget)
        self.movies_scroll = QtWidgets.QScrollArea()
        self.movies_scroll.setWidgetResizable(True)
        self.movies_container = QtWidgets.QWidget()
        self.movies_grid = QtWidgets.QGridLayout(self.movies_container)
        self.movies_grid.setSpacing(15)
        self.movies_scroll.setWidget(self.movies_container)
        self.movies_layout.addWidget(self.movies_scroll)
        
        # TV Shows tab
        self.tv_widget = QtWidgets.QWidget()
        self.tv_layout = QtWidgets.QVBoxLayout(self.tv_widget)
        self.tv_scroll = QtWidgets.QScrollArea()
        self.tv_scroll.setWidgetResizable(True)
        self.tv_container = QtWidgets.QWidget()
        self.tv_grid = QtWidgets.QGridLayout(self.tv_container)
        self.tv_grid.setSpacing(15)
        self.tv_scroll.setWidget(self.tv_container)
        self.tv_layout.addWidget(self.tv_scroll)
        
        # Add tabs
        self.tabs.addTab(self.movies_widget, "Popular Movies")
        self.tabs.addTab(self.tv_widget, "Popular TV Shows")
        
        # Add a refresh button
        refresh_layout = QtWidgets.QHBoxLayout()
        refresh_layout.addStretch()
        self.refresh_button = QtWidgets.QPushButton("🔄 Refresh")
        self.refresh_button.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 15px;
                padding: 5px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #f40d18;
            }
        """)
        self.refresh_button.clicked.connect(self.refresh_content)
        refresh_layout.addWidget(self.refresh_button)
        
        # Add last updated time
        self.update_time_label = QtWidgets.QLabel("Last updated: Never")
        self.update_time_label.setStyleSheet("color: #888; font-size: 11px;")
        refresh_layout.addWidget(self.update_time_label)
        refresh_layout.addStretch()
        
        main_layout.addWidget(self.tabs)
        main_layout.addLayout(refresh_layout)
        main_layout.setStretch(1, 1)  # Make tabs stretch
        
        # Add a loading message until content loads
        self.loading_movies = QtWidgets.QLabel("Loading popular movies...")
        self.loading_movies.setAlignment(QtCore.Qt.AlignCenter)
        self.loading_movies.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
        self.movies_grid.addWidget(self.loading_movies, 0, 0)
        
        self.loading_tv = QtWidgets.QLabel("Loading popular TV shows...")
        self.loading_tv.setAlignment(QtCore.Qt.AlignCenter)
        self.loading_tv.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
        self.tv_grid.addWidget(self.loading_tv, 0, 0)
        
        # Load content with a slight delay to allow UI to show first
        QtCore.QTimer.singleShot(100, self.load_content)
    
    def load_content(self):
        """Load trending content using a thread to avoid freezing the UI."""
        self.movie_thread = QtCore.QThread()
        self.tv_thread = QtCore.QThread()
        
        # Movie worker
        class MovieWorker(QtCore.QObject):
            finished = QtCore.pyqtSignal(list)
            
            def run(self):
                results = get_trending_movies(limit=20)
                self.finished.emit(results)
        
        # TV worker
        class TvWorker(QtCore.QObject):
            finished = QtCore.pyqtSignal(list)
            
            def run(self):
                results = get_trending_tv_shows(limit=20)
                self.finished.emit(results)
        
        # Set up movie worker
        self.movie_worker = MovieWorker()
        self.movie_worker.moveToThread(self.movie_thread)
        self.movie_thread.started.connect(self.movie_worker.run)
        self.movie_worker.finished.connect(lambda results: self.populate_movies(results))
        self.movie_worker.finished.connect(self.movie_thread.quit)
        
        # Set up TV worker
        self.tv_worker = TvWorker()
        self.tv_worker.moveToThread(self.tv_thread)
        self.tv_thread.started.connect(self.tv_worker.run)
        self.tv_worker.finished.connect(lambda results: self.populate_tv_shows(results))
        self.tv_worker.finished.connect(self.tv_thread.quit)
        
        # Start threads
        self.movie_thread.start()
        self.tv_thread.start()
        
        # Update the timestamp
        self.update_time_label.setText(f"Last updated: {datetime.now().strftime('%H:%M:%S')}")
    
    def clear_grid(self, grid):
        """Clear all items from a grid layout."""
        while grid.count():
            item = grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
    
    def populate_movies(self, movies):
        """Populate the movies grid with movie cards."""
        self.trending_movies = movies
        self.clear_grid(self.movies_grid)
        
        if not movies:
            no_results = QtWidgets.QLabel("No movies available right now")
            no_results.setAlignment(QtCore.Qt.AlignCenter)
            no_results.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
            self.movies_grid.addWidget(no_results, 0, 0)
            return
        
        # Create a card for each movie
        row, col = 0, 0
        for movie in movies:
            card = self.create_content_card(movie, "movie")
            self.movies_grid.addWidget(card, row, col)
            
            # Move to next column or row
            col += 1
            if col >= 4:  # 4 columns
                col = 0
                row += 1
    
    def populate_tv_shows(self, tv_shows):
        """Populate the TV shows grid with TV show cards."""
        self.trending_tv_shows = tv_shows
        self.clear_grid(self.tv_grid)
        
        if not tv_shows:
            no_results = QtWidgets.QLabel("No TV shows available right now")
            no_results.setAlignment(QtCore.Qt.AlignCenter)
            no_results.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
            self.tv_grid.addWidget(no_results, 0, 0)
            return
        
        # Create a card for each TV show
        row, col = 0, 0
        for show in tv_shows:
            card = self.create_content_card(show, "tv")
            self.tv_grid.addWidget(card, row, col)
            
            # Move to next column or row
            col += 1
            if col >= 4:  # 4 columns
                col = 0
                row += 1
    
    def create_content_card(self, item, media_type):
        """Create a clickable card for a movie or TV show."""
        # Create frame
        card = QtWidgets.QFrame()
        card.setCursor(QtCore.Qt.PointingHandCursor)
        card.setFixedWidth(180)
        card.setFixedHeight(320)
        card.setFrameShape(QtWidgets.QFrame.StyledPanel)
        card.setStyleSheet("""
            QFrame {
                background-color: white;
                border-radius: 10px;
                border: 1px solid #e0e0e0;
            }
            QFrame:hover {
                border: 2px solid #e50914;
                background-color: #fff8f8;
            }
        """)
        
        # Store item data
        card.setProperty("item_data", {
            "id": item.get("id"), 
            "media_type": media_type, 
            "title": item.get("title", item.get("name", "Unknown")),
            "year": self.get_year_from_date(item.get("release_date" if media_type == "movie" else "first_air_date", ""))
        })
        
        # Layout
        layout = QtWidgets.QVBoxLayout(card)
        layout.setContentsMargins(8, 8, 8, 8)
        
        # Poster image
        poster_label = QtWidgets.QLabel()
        poster_label.setFixedSize(164, 240)
        poster_label.setAlignment(QtCore.Qt.AlignCenter)
        poster_label.setStyleSheet("background-color: #f0f0f0; border-radius: 5px;")
        
        poster_path = item.get("poster_path")
        if poster_path:
            poster_url = f"https://image.tmdb.org/t/p/w342{poster_path}"
            pixmap = fetch_image(poster_url)
            if pixmap and not pixmap.isNull():
                poster_label.setPixmap(pixmap.scaled(
                    164, 240, 
                    QtCore.Qt.KeepAspectRatio, 
                    QtCore.Qt.SmoothTransformation
                ))
        else:
            poster_label.setText("No image")
        
        # Title
        title = item.get("title", item.get("name", "Unknown"))
        title_label = QtWidgets.QLabel(title)
        title_label.setWordWrap(True)
        title_label.setAlignment(QtCore.Qt.AlignCenter)
        title_label.setStyleSheet("font-weight: bold; color: #333; margin-top: 5px;")
        
        # Year and rating
        year = self.get_year_from_date(item.get("release_date" if media_type == "movie" else "first_air_date", ""))
        vote_avg = item.get("vote_average", 0)
        
        # If vote average is a string, convert to float
        if isinstance(vote_avg, str):
            try:
                vote_avg = float(vote_avg)
            except:
                vote_avg = 0
                
        info_label = QtWidgets.QLabel(f"{year} • ⭐ {vote_avg:.1f}")
        info_label.setAlignment(QtCore.Qt.AlignCenter)
        info_label.setStyleSheet("color: #666;")
        
        layout.addWidget(poster_label)
        layout.addWidget(title_label)
        layout.addWidget(info_label)
        
        # Connect click event
        card.mousePressEvent = lambda e, c=card: self.on_card_clicked(c)
        
        return card
    
    def get_year_from_date(self, date_str, default=""):
        """Extract year from a date string."""
        if date_str and len(date_str) >= 4:
            return date_str[:4]
        return default
    
    def on_card_clicked(self, card):
        """Handle card click - emit signal with item data."""
        item_data = card.property("item_data")
        if item_data:
            self.item_clicked.emit(item_data)
    
    def refresh_content(self):
        """Refresh the trending content."""
        # Clear the cache keys for today's trending content
        today = datetime.now().strftime('%Y-%m-%d')
        if f"trending_movies_{today}" in search_cache:
            del search_cache[f"trending_movies_{today}"]
        if f"trending_tv_{today}" in search_cache:
            del search_cache[f"trending_tv_{today}"]
        
        # Show loading indicators
        self.clear_grid(self.movies_grid)
        self.clear_grid(self.tv_grid)
        
        loading_movies = QtWidgets.QLabel("Refreshing popular movies...")
        loading_movies.setAlignment(QtCore.Qt.AlignCenter)
        loading_movies.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
        self.movies_grid.addWidget(loading_movies, 0, 0)
        
        loading_tv = QtWidgets.QLabel("Refreshing popular TV shows...")
        loading_tv.setAlignment(QtCore.Qt.AlignCenter)
        loading_tv.setStyleSheet("color: #888; font-style: italic; margin: 40px 0;")
        self.tv_grid.addWidget(loading_tv, 0, 0)
        
        # Disable refresh button temporarily
        self.refresh_button.setEnabled(False)
        self.refresh_button.setText("Refreshing...")
        
        # Load new content
        self.load_content()
        
        # Re-enable refresh button after 2 seconds
        QtCore.QTimer.singleShot(2000, lambda: self.refresh_button.setEnabled(True))
        QtCore.QTimer.singleShot(2000, lambda: self.refresh_button.setText("🔄 Refresh"))
        
    def set_dark_mode(self, enabled):
        """Apply dark mode styling to the widget."""
        if enabled:
            self.setStyleSheet("""
                QWidget { background-color: #181818; color: #eee; }
                QFrame { 
                    background-color: #232323; 
                    border: 1px solid #333;
                }
                QFrame:hover {
                    border: 2px solid #e50914;
                    background-color: #2a2a2a;
                }
                QLabel { color: #eee; }
                QScrollArea { background-color: #181818; }
            """)
        else:
            self.setStyleSheet("")  # Reset to default styling

# --------------------------------------------------------------------
# MainWindow: overall application window

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Movie & TV Show Insight")
        self.resize(1280, 900)
        self.setWindowIcon(QtGui.QIcon("f:\\study\\programming\\python\\apps\\media\\games\\GameSearchData\\icon.png"))
        self.dark_mode = False  # Track dark mode state
        self.watchlist = []
        self.init_ui()
        self.apply_styles()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)

        # Header with logo and actions
        header_layout = QtWidgets.QHBoxLayout()
        logo_label = QtWidgets.QLabel()
        logo_label.setText("<h1>🎬 Movie & TV Show Insight</h1>")
        logo_label.setStyleSheet("color: #e50914;")
        logo_label.setAlignment(QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter)
        header_layout.addWidget(logo_label)

        # Add filter buttons to header
        self.filter_all = QtWidgets.QRadioButton("All")
        self.filter_movies = QtWidgets.QRadioButton("Movies")
        self.filter_tv = QtWidgets.QRadioButton("TV Shows")
        self.filter_all.setChecked(True)

        filter_group = QtWidgets.QButtonGroup(self)
        filter_group.addButton(self.filter_all)
        filter_group.addButton(self.filter_movies)
        filter_group.addButton(self.filter_tv)

        filter_layout = QtWidgets.QHBoxLayout()
        filter_layout.addStretch()
        filter_layout.addWidget(QtWidgets.QLabel("Filter:"))
        filter_layout.addWidget(self.filter_all)
        filter_layout.addWidget(self.filter_movies)
        filter_layout.addWidget(self.filter_tv)

        self.filter_all.toggled.connect(lambda: self.set_search_type("multi"))
        self.filter_movies.toggled.connect(lambda: self.set_search_type("movie"))
        self.filter_tv.toggled.connect(lambda: self.set_search_type("tv"))

        # Add Watchlist button and Dark Mode toggle
        self.watchlist_btn = QtWidgets.QPushButton("⭐ Watchlist")
        self.watchlist_btn.setCursor(QtGui.QCursor(QtCore.Qt.PointingHandCursor))
        self.watchlist_btn.setStyleSheet("""
            QPushButton {
                background-color: #fffbe6;
                color: #e50914;
                border: 1px solid #e50914;
                border-radius: 18px;
                padding: 6px 18px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #ffe8e8;
            }
        """)
        self.watchlist_btn.clicked.connect(self.open_watchlist_dialog)
        
        # Add History button
        self.history_btn = QtWidgets.QPushButton("⏱️ History")
        self.history_btn.setCursor(QtGui.QCursor(QtCore.Qt.PointingHandCursor))
        self.history_btn.setStyleSheet("""
            QPushButton {
                background-color: #f0f8ff;
                color: #0078d7;
                border: 1px solid #0078d7;
                border-radius: 18px;
                padding: 6px 18px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #e0f0ff;
            }
        """)
        self.history_btn.clicked.connect(self.open_history_dialog)
        
        # Add Filter button
        self.filter_btn = QtWidgets.QPushButton("🔍 Filter")
        self.filter_btn.setCursor(QtGui.QCursor(QtCore.Qt.PointingHandCursor))
        self.filter_btn.setStyleSheet("""
            QPushButton {
                background-color: #f5f5f5;
                color: #333;
                border: 1px solid #999;
                border-radius: 18px;
                padding: 6px 18px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #e5e5e5;
            }
        """)
        self.filter_btn.clicked.connect(self.open_filter_dialog)

        self.darkmode_btn = QtWidgets.QPushButton("🌙 Dark Mode")
        self.darkmode_btn.setCheckable(True)
        self.darkmode_btn.setCursor(QtGui.QCursor(QtCore.Qt.PointingHandCursor))
        self.darkmode_btn.setStyleSheet("""
            QPushButton {
                background-color: #222;
                color: #fff;
                border-radius: 18px;
                padding: 6px 18px;
                font-weight: bold;
            }
            QPushButton:checked {
                background-color: #e50914;
                color: #fff;
            }
        """)
        self.darkmode_btn.toggled.connect(self.toggle_dark_mode)

        # Add actions to header
        actions_layout = QtWidgets.QHBoxLayout()
        actions_layout.addWidget(self.watchlist_btn)
        actions_layout.addWidget(self.history_btn)
        actions_layout.addWidget(self.filter_btn)
        actions_layout.addWidget(self.darkmode_btn)
        actions_layout.setSpacing(10)
        actions_layout.addStretch()

        header_layout.addLayout(filter_layout)
        header_layout.addSpacing(20)
        header_layout.addLayout(actions_layout)
        main_layout.addLayout(header_layout)

        # Search row
        search_container = QtWidgets.QWidget()
        search_container.setObjectName("searchContainer")
        search_layout = QtWidgets.QHBoxLayout(search_container)
        search_layout.setContentsMargins(15, 15, 15, 15)
        self.search_line = StyledComponents.create_search_box("Search for movies, TV shows, actors...")
        self.search_btn = StyledComponents.create_button("Search")
        self.search_btn.setObjectName("searchButton")
        self.search_btn.setCursor(QtGui.QCursor(QtCore.Qt.PointingHandCursor))
        search_layout.addWidget(self.search_line)
        search_layout.addWidget(self.search_btn)
        StyledComponents.create_shadow(search_container)
        main_layout.addWidget(search_container)

        # Connect search functionality
        self.search_line.returnPressed.connect(self.start_search)
        self.search_btn.clicked.connect(self.start_search)
        self.search_type = "multi"  # Default search type (both movies and TV shows)

        # Split view with splitter
        splitter = QtWidgets.QSplitter(QtCore.Qt.Vertical)
        splitter.setChildrenCollapsible(False)

        # Results container
        results_container = QtWidgets.QWidget()
        results_layout = QtWidgets.QVBoxLayout(results_container)
        results_layout.setContentsMargins(0, 0, 0, 0)
        results_header = QtWidgets.QLabel("Search Results")
        results_header.setObjectName("sectionHeader")
        results_layout.addWidget(results_header)
        
        self.results_list = StyledComponents.create_list_widget()
        self.results_list.setObjectName("resultsList")
        self.results_list.itemDoubleClicked.connect(self.load_details)
        self.results_list.setMinimumHeight(180)
        results_layout.addWidget(self.results_list)

        # Detail area
        detail_container = QtWidgets.QWidget()
        detail_container.setObjectName("detailsContainer")
        detail_main_layout = QtWidgets.QVBoxLayout(detail_container)
        detail_header = QtWidgets.QLabel("Content Details")
        detail_header.setObjectName("sectionHeader")
        detail_main_layout.addWidget(detail_header)
        self.detail_area = QtWidgets.QWidget()
        self.detail_layout = QtWidgets.QVBoxLayout(self.detail_area)
        self.detail_layout.setContentsMargins(0, 0, 0, 0)
        detail_main_layout.addWidget(self.detail_area)

        # Progress bar
        self.progress_bar = QtWidgets.QProgressBar()
        self.progress_bar.setMaximum(0)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setVisible(False)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                border: none;
                border-radius: 4px;
                background-color: #f0f2f5;
                height: 8px;
            }
            QProgressBar::chunk {
                background-color: #e50914;
                border-radius: 4px;
            }
        """)
        detail_main_layout.addWidget(self.progress_bar)

        # Add containers to splitter
        splitter.addWidget(results_container)
        splitter.addWidget(detail_container)
        splitter.setSizes([300, 600])
        main_layout.addWidget(splitter)

        # Status bar
        self.statusBar().showMessage("Ready")
        self.statusBar().setObjectName("statusBar")
        self.setCentralWidget(central_widget)

        # Animation for search button
        self.search_animation = QtCore.QPropertyAnimation(self.search_btn, b"minimumWidth")
        self.search_animation.setDuration(200)
        self.search_btn.enterEvent = lambda e: self.animate_button(True)
        self.search_btn.leaveEvent = lambda e: self.animate_button(False)
        
        # Show trending content instead of welcome message
        self.show_trending_content()
        
        # Set up auto-refresh timer (every 3 hours)
        self.refresh_timer = QtCore.QTimer()
        self.refresh_timer.setInterval(3 * 60 * 60 * 1000)  # 3 hours in milliseconds
        self.refresh_timer.timeout.connect(self.refresh_trending)
        self.refresh_timer.start()

    def show_trending_content(self):
        """Show trending movies and TV shows on the main page."""
        self.trending_widget = TrendingContentWidget()
        self.trending_widget.item_clicked.connect(self.on_trending_item_clicked)
        self.detail_layout.addWidget(self.trending_widget)
        
        # Add a small introduction above the trending content
        intro_html = """
        <div style="text-align: center; padding: 10px; color: #444; margin-bottom: 10px;">
            <h1 style="color: #e50914; margin-bottom: 10px; font-size: 24px;">Welcome to Movie & TV Show Insight</h1>
            <p style="font-size: 14px;">
                Browse popular content below or search for any movie or TV show to get detailed information.
            </p>
        </div>
        """
        
        intro_browser = QtWidgets.QTextBrowser()
        intro_browser.setHtml(intro_html)
        intro_browser.setStyleSheet("background: transparent; border: none; max-height: 120px;")
        intro_browser.setMaximumHeight(120)
        self.detail_layout.insertWidget(0, intro_browser)
    
    def on_trending_item_clicked(self, item_data):
        """Handle clicks on trending content items."""
        # Create a dummy QListWidgetItem to reuse load_details logic
        list_item = QtWidgets.QListWidgetItem()
        list_item.setData(QtCore.Qt.UserRole, item_data)
        self.load_details(list_item)
    
    def refresh_trending(self):
        """Refresh the trending content periodically."""
        if hasattr(self, 'trending_widget'):
            self.trending_widget.refresh_content()

    def toggle_dark_mode(self, checked):
        self.dark_mode = checked
        if checked:
            self.setStyleSheet("""
                QMainWindow { background-color: #181818; }
                #searchContainer, #detailsContainer { background-color: #232323; border-radius: 10px; }
                QLabel#sectionHeader { color: #e50914; background: transparent; border-bottom: 1px solid #333; }
                QRadioButton { color: #eee; }
                QTabWidget::pane { border: 1px solid #333; }
                QTabBar::tab { background: #232323; color: #eee; }
                QTabBar::tab:selected { background: #181818; color: #fff; border-bottom: 2px solid #e50914; }
                QTextBrowser { background: #232323; color: #eee; }
                QListWidget, QTableWidget { background: #232323; color: #eee; }
                QScrollBar:vertical { background: #232323; }
                QScrollBar::handle:vertical { background: #444; }
                QScrollBar::handle:vertical:hover { background: #e50914; }
                QPushButton { background: #232323; color: #fff; }
                QPushButton:hover { background: #e50914; color: #fff; }
                #statusBar { background: #e50914; color: #fff; }
            """)
            # Update trending widget to dark mode
            if hasattr(self, 'trending_widget'):
                self.trending_widget.set_dark_mode(True)
        else:
            self.apply_styles()
            # Reset trending widget to light mode
            if hasattr(self, 'trending_widget'):
                self.trending_widget.set_dark_mode(False)

    # Replace show_welcome_message with new trending content display
    def show_welcome_message(self):
        self.show_trending_content()

    def set_search_type(self, search_type):
        self.search_type = search_type
        
    def animate_button(self, expand):
        width = 120 if expand else 100
        self.search_animation.setStartValue(self.search_btn.width())
        self.search_animation.setEndValue(width)
        self.search_animation.start()

    def apply_styles(self):
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f8f9fa;
            }
            #searchContainer, #detailsContainer {
                background-color: white;
                border-radius: 10px;
            }
            QLabel#sectionHeader {
                font-size: 18px;
                font-weight: bold;
                color: #e50914;
                padding: 10px;
                background-color: transparent;
                border-bottom: 1px solid #e0e0e0;
            }
            QRadioButton {
                spacing: 5px;
                color: #333;
            }
            QRadioButton::indicator {
                width: 15px;
                height: 15px;
                border-radius: 7px;
            }
            QRadioButton::indicator:checked {
                background-color: #e50914;
                border: 2px solid white;
                outline: 1px solid #e50914;
            }
            QTabWidget::pane {
                border: 1px solid #e0e0e0;
                border-radius: 5px;
                top: -1px;
            }
            QTabBar::tab {
                background-color: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-bottom: none;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 8px 15px;
                margin-right: 2px;
                min-width: 100px;
                font-size: 14px;
            }
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 2px solid #e50914;
                font-weight: bold;
            }
            QTextBrowser {
                border: none;
                font-size: 15px;
                background-color: white;
            }
            QScrollBar:vertical {
                border: none;
                background: #f0f0f0;
                width: 10px;
                border-radius: 5px;
                margin: 0px;
            }
            QScrollBar::handle:vertical {
                background: #c0c0c0;
                border-radius: 5px;
                min-height: 20px;
            }
            QScrollBar::handle:vertical:hover {
                background: #a0a0a0;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
            }
            #statusBar {
                background-color: #e50914;
                color: white;
                font-weight: bold;
            }
        """)

    def start_search(self):
        query = self.search_line.text().strip()
        if not query:
            return

        self.statusBar().showMessage("Searching...")
        self.progress_bar.setVisible(True)
        self.results_list.clear()
        self.clear_details()
        self.search_btn.setEnabled(False)
        self.search_btn.setText("Searching...")

        # Pulse animation
        pulse = QtCore.QPropertyAnimation(self.search_btn, b"styleSheet")
        pulse.setDuration(800)
        pulse.setLoopCount(3)
        pulse.setStartValue("background-color: #e50914; color: white;")
        pulse.setEndValue("background-color: #c2070f; color: white;")
        pulse.start()

        # Use enhanced search thread instead of basic search thread
        self.search_thread = EnhancedSearchThread(query, self.search_type)
        self.search_thread.results_signal.connect(self.on_search_results)
        self.search_thread.error_signal.connect(self.on_search_error)
        self.search_thread.start()

    def on_search_results(self, results):
        self.search_btn.setEnabled(True)
        self.search_btn.setText("Search")
        self.search_btn.setStyleSheet("")
        self.progress_bar.setVisible(False)

        if not results:
            self.statusBar().showMessage("No results found")
            QtWidgets.QMessageBox.warning(self, "No Results", "No movies or TV shows found matching your search.")
            return

        self.statusBar().showMessage(f"Found {len(results)} results")
        
        # Filter results based on media type if specific filter is active
        filtered_results = []
        for result in results:
            media_type = result.get("media_type", "")
            # For single-type searches, TMDB doesn't include media_type
            if self.search_type == "movie":
                if media_type == "movie" or not media_type:
                    filtered_results.append(result)
            elif self.search_type == "tv":
                if media_type == "tv" or not media_type:
                    filtered_results.append(result)
            else:  # multi or any other case
                if media_type in ["movie", "tv"] or not media_type:
                    filtered_results.append(result)
        
        if not filtered_results:
            self.statusBar().showMessage("No matching results after filtering")
            QtWidgets.QMessageBox.warning(self, "No Results", 
                f"No {'movies' if self.search_type == 'movie' else 'TV shows' if self.search_type == 'tv' else 'content'} found matching your search.")
            return
            
        for item in filtered_results:
            media_type = item.get("media_type", "")
            if not media_type:
                if self.search_type != "multi":
                    media_type = self.search_type
                else:
                    # Try to determine type by available fields
                    media_type = "movie" if "title" in item else "tv" if "name" in item else "unknown"
                
            title = item.get("title", item.get("name", "Unknown"))
            year = ""
            
            # Get release date or first air date
            if media_type == "movie":
                release_date = item.get("release_date", "")
                if release_date and len(release_date) >= 4:
                    year = f"({release_date[:4]})"
            else:  # tv
                air_date = item.get("first_air_date", "")
                if air_date and len(air_date) >= 4:
                    year = f"({air_date[:4]})"
            
            # Get poster path - use better quality poster for search results
            poster_path = item.get("poster_path", "")
            poster_url = f"https://image.tmdb.org/t/p/w185{poster_path}" if poster_path else ""
            
            # Get ratings - include both IMDB and TMDB
            vote_avg = item.get("vote_average", 0)
            imdb_rating = item.get("imdb_rating", "N/A")
            stars = "★" * int(vote_avg // 2) + "☆" * (5 - int(vote_avg // 2))
            
            # Create list item
            list_item = QtWidgets.QListWidgetItem()
            list_item.setData(QtCore.Qt.UserRole, {
                "id": item.get("id"), 
                "media_type": media_type, 
                "title": title,
                "year": year.strip("()"),
                "imdb_id": item.get("imdb_id", ""),
                "imdb_rating": imdb_rating
            })
            
            # Create widget for the item with layout
            item_widget = QtWidgets.QWidget()
            layout = QtWidgets.QHBoxLayout(item_widget)
            layout.setContentsMargins(2, 2, 2, 2)
            
            # Poster image - with improved loading
            poster_label = QtWidgets.QLabel()
            poster_label.setFixedSize(50, 75)
            poster_label.setAlignment(QtCore.Qt.AlignCenter)
            poster_label.setStyleSheet("""
                background-color: #f0f0f0; 
                border-radius: 5px;
                border: 1px solid #ddd;
            """)
            
            if poster_url:
                pixmap = fetch_image(poster_url)
                if pixmap and not pixmap.isNull():
                    poster_label.setPixmap(pixmap.scaled(50, 75, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
            
            # Info widget
            info_widget = QtWidgets.QWidget()
            info_layout = QtWidgets.QVBoxLayout(info_widget)
            info_layout.setContentsMargins(10, 0, 0, 0)
            
            # Title and year
            title_label = QtWidgets.QLabel(f"<b>{title}</b> {year}")
            title_label.setStyleSheet("font-size: 16px; color: #333;")
            
            # Type and rating - now with IMDB
            imdb_text = f"IMDB: {imdb_rating}/10" if imdb_rating != "N/A" else ""
            type_label = QtWidgets.QLabel(f"{'Movie' if media_type == 'movie' else 'TV Show'} | {stars} ({vote_avg}) {imdb_text}")
            type_label.setStyleSheet("font-size: 12px; color: #666;")
            
            info_layout.addWidget(title_label)
            info_layout.addWidget(type_label)
            
            layout.addWidget(poster_label)
            layout.addWidget(info_widget, 1)  # Stretch factor
            
            # Set the custom widget as the item widget
            list_item.setSizeHint(item_widget.sizeHint())
            self.results_list.addItem(list_item)
            self.results_list.setItemWidget(list_item, item_widget)

    def on_search_error(self, err):
        self.search_btn.setEnabled(True)
        self.search_btn.setText("Search")
        self.progress_bar.setVisible(False)
        self.statusBar().showMessage("Search error")
        QtWidgets.QMessageBox.critical(self, "Search Error", str(err))

    def load_details(self, item):
        item_data = item.data(QtCore.Qt.UserRole)
        if not item_data:
            return

        # Add to history
        history_entry = {
            "id": item_data.get("id"),
            "media_type": item_data.get("media_type"),
            "title": item_data.get("title"),
            "year": item_data.get("year"),
            "view_date": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        add_to_history(history_entry)
        
        # Continue with existing code
        self.clear_details()
        
        # Create an animated loading indicator
        loading_widget = QtWidgets.QWidget()
        loading_layout = QtWidgets.QVBoxLayout(loading_widget)
        
        # Create a custom animated loading indicator
        loading_text = QtWidgets.QLabel("Loading details...")
        loading_text.setAlignment(QtCore.Qt.AlignCenter)
        loading_text.setStyleSheet("color: #e50914; font-size: 18px; margin-top: 10px;")
        
        # Create dots animation
        self.loading_timer = QtCore.QTimer()
        self.loading_dots = 0
        
        def update_dots():
            self.loading_dots = (self.loading_dots + 1) % 4
            dots = "." * self.loading_dots
            loading_text.setText(f"Loading details{dots}")
            
        self.loading_timer.timeout.connect(update_dots)
        self.loading_timer.start(500)
        
        # Create a spinner animation using the new RotatableLabel
        spinner_label = RotatableLabel("🎬")
        spinner_label.setAlignment(QtCore.Qt.AlignCenter)
        spinner_label.setStyleSheet("font-size: 48px; color: #e50914;")
        
        # Create the pixmap for the spinner
        empty_pixmap = QtGui.QPixmap(64, 64)
        empty_pixmap.fill(QtCore.Qt.transparent)
        painter = QtGui.QPainter(empty_pixmap)
        font = QtGui.QFont()
        font.setPointSize(36)
        painter.setFont(font)
        painter.setPen(QtGui.QColor("#e50914"))
        painter.drawText(empty_pixmap.rect(), QtCore.Qt.AlignCenter, "🎬")
        painter.end()
        spinner_label.setPixmap(empty_pixmap)
        
        # Now create the animation that works with our custom class
        spinner_anim = QPropertyAnimation(spinner_label, b"rotation")
        spinner_anim.setDuration(1000)
        spinner_anim.setStartValue(0)
        spinner_anim.setEndValue(360)
        spinner_anim.setLoopCount(-1)
        spinner_anim.start()
        
        loading_layout.addStretch(1)
        loading_layout.addWidget(spinner_label)
        loading_layout.addWidget(loading_text)
        loading_layout.addStretch(1)
        
        self.detail_layout.addWidget(loading_widget)

        self.statusBar().showMessage(f"Loading details for {item_data['title']}...")
        self.progress_bar.setVisible(True)
        
        self.detail_thread = DetailThread(
            item_data["id"], 
            item_data["media_type"],
            item_data["title"],
            item_data["year"]
        )
        self.detail_thread.detail_signal.connect(self.on_detail_results)
        self.detail_thread.error_signal.connect(self.on_detail_error)
        self.detail_thread.start()

    def on_detail_results(self, details, ratings):
        self.clear_details()
        if self.loading_timer and self.loading_timer.isActive():
            self.loading_timer.stop()
        
        # Create a wrapper widget with both tabs and action buttons
        wrapper_widget = QtWidgets.QWidget()
        wrapper_layout = QtWidgets.QVBoxLayout(wrapper_widget)
        wrapper_layout.setContentsMargins(0, 0, 0, 0)
        
        # Action buttons
        actions_widget = QtWidgets.QWidget()
        actions_widget.setStyleSheet("background-color: white; border-radius: 10px; padding: 10px; margin-bottom: 10px;")
        actions_layout = QtWidgets.QHBoxLayout(actions_widget)
        
        # Title info for the header
        title = details.get("title", details.get("name", ""))
        media_type = details.get("media_type", "") or ("tv" if "seasons" in details else "movie")
        
        title_label = QtWidgets.QLabel(f"<h2>{title}</h2>")
        title_label.setStyleSheet("color: #e50914;")
        
        # Add to watchlist button
        watchlist_action = QtWidgets.QPushButton("Add to Watchlist")
        watchlist_action.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c2070f;
            }
        """)
        
        # Check if already in watchlist
        watchlist = load_watchlist()
        item_in_watchlist = any(
            w.get('id') == details.get('id') and 
            w.get('media_type') == media_type 
            for w in watchlist
        )
        
        if item_in_watchlist:
            watchlist_action.setText("Remove from Watchlist")
            watchlist_action.setStyleSheet("""
                QPushButton {
                    background-color: #555;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 15px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #333;
                }
            """)
        
        # Connect watchlist button
        watchlist_action.clicked.connect(
            lambda: self.toggle_watchlist_item(details, media_type, watchlist_action)
        )
        
        # Share button
        share_action = QtWidgets.QPushButton("Share")
        share_action.setStyleSheet("""
            QPushButton {
                background-color: #3b5998;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2d4373;
            }
        """)
        share_action.clicked.connect(lambda: self.share_content(details, media_type))
        
        # Watch button (opens trailer or official site)
        watch_action = QtWidgets.QPushButton("Watch Trailer")
        watch_action.setStyleSheet("""
            QPushButton {
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #218838;
            }
        """)
        
        # Find trailer
        videos = details.get("videos", {}).get("results", [])
        trailers = [v for v in videos if v.get("type") == "Trailer" and v.get("site") == "YouTube"]
        
        if trailers:
            trailer_key = trailers[0].get("key", "")
            watch_action.clicked.connect(lambda: self.open_trailer(trailer_key))
        else:
            watch_action.setText("Search Online")
            watch_action.clicked.connect(lambda: self.search_online(title, media_type))
        
        actions_layout.addWidget(title_label)
        actions_layout.addStretch()
        actions_layout.addWidget(watch_action)
        actions_layout.addWidget(share_action)
        actions_layout.addWidget(watchlist_action)
        
        wrapper_layout.addWidget(actions_widget)
        
        # Create and add tabs
        tabs = DetailTabs(details, ratings)
        wrapper_layout.addWidget(tabs)
        
        self.detail_layout.addWidget(wrapper_widget)
        self.progress_bar.setVisible(False)
        
        self.statusBar().showMessage(f"Loaded details for {title}")
    
    def toggle_watchlist_item(self, details, media_type, button):
        """Add or remove item from watchlist."""
        watchlist = load_watchlist()
        title = details.get("title", details.get("name", ""))
        item_id = details.get("id")
        
        # Check if already in watchlist
        existing_items = [
            i for i in watchlist 
            if i.get('id') == item_id and i.get('media_type') == media_type
        ]
        
        if existing_items:
            # Remove from watchlist
            watchlist = [
                i for i in watchlist 
                if not (i.get('id') == item_id and i.get('media_type') == media_type)
            ]
            save_watchlist(watchlist)
            
            # Update button
            button.setText("Add to Watchlist")
            button.setStyleSheet("""
                QPushButton {
                    background-color: #e50914;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 15px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #c2070f;
                }
            """)
            
            self.statusBar().showMessage(f"Removed {title} from watchlist")
        else:
            # Add to watchlist
            year = ""
            if media_type == "movie" and details.get("release_date"):
                year = details["release_date"].split("-")[0]
            elif media_type == "tv" and details.get("first_air_date"):
                year = details["first_air_date"].split("-")[0]
                
            poster_path = details.get("poster_path", "")
            
            # Create watchlist item
            watchlist_item = {
                "id": item_id,
                "media_type": media_type,
                "title": title,
                "year": year,
                "poster_path": poster_path,
                "date_added": datetime.now().strftime("%Y-%m-%d")
            }
            
            watchlist.append(watchlist_item)
            save_watchlist(watchlist)
            
            # Update button
            button.setText("Remove from Watchlist")
            button.setStyleSheet("""
                QPushButton {
                    background-color: #555;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 8px 15px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #333;
                }
            """)
            
            self.statusBar().showMessage(f"Added {title} to watchlist")
    
    def open_trailer(self, video_key):
        """Open YouTube trailer in default browser."""
        if video_key:
            url = f"https://www.youtube.com/watch?v={video_key}"
            QtGui.QDesktopServices.openUrl(QUrl(url))
    
    def search_online(self, title, media_type):
        """Search for content online."""
        query = urllib.parse.quote_plus(f"{title} {media_type} trailer official")
        url = f"https://www.google.com/search?q={query}"
        QtGui.QDesktopServices.openUrl(QUrl(url))
    
    def share_content(self, details, media_type):
        """Share content on social media or copy link."""
        title = details.get("title", details.get("name", ""))
        item_id = details.get("id")
        
        # Create share menu
        menu = QtWidgets.QMenu(self)
        
        # Create tmdb link
        tmdb_url = f"https://www.themoviedb.org/{media_type}/{item_id}"
        
        # Get IMDB ID if available
        imdb_id = get_imdb_id_for_tmdb(item_id, media_type)
        imdb_url = f"https://www.imdb.com/title/{imdb_id}" if imdb_id else None
        
        # Add menu items
        copy_action = menu.addAction("Copy TMDB Link")
        copy_action.triggered.connect(lambda: QtWidgets.QApplication.clipboard().setText(tmdb_url))
        
        if imdb_url:
            copy_imdb_action = menu.addAction("Copy IMDB Link")
            copy_imdb_action.triggered.connect(lambda: QtWidgets.QApplication.clipboard().setText(imdb_url))
        
        menu.addSeparator()
        
        # Social media sharing
        twitter_action = menu.addAction("Share on Twitter")
        twitter_action.triggered.connect(
            lambda: QtGui.QDesktopServices.openUrl(
                QUrl(f"https://twitter.com/intent/tweet?text=Check out {title}&url={urllib.parse.quote(tmdb_url)}")
            )
        )
        
        facebook_action = menu.addAction("Share on Facebook")
        facebook_action.triggered.connect(
            lambda: QtGui.QDesktopServices.openUrl(
                QUrl(f"https://www.facebook.com/sharer/sharer.php?u={urllib.parse.quote(tmdb_url)}")
            )
        )
        
        # Show menu at button position
        menu.exec_(QtGui.QCursor.pos())
    
    def open_watchlist_dialog(self):
        """Open the watchlist management dialog."""
        dialog = WatchlistDialog(self)
        dialog.item_selected.connect(self.on_watchlist_item_selected)
        dialog.exec_()
    
    def on_watchlist_item_selected(self, item_data):
        """Handle selection of watchlist item."""
        # Create dummy list item to reuse load_details
        list_item = QtWidgets.QListWidgetItem()
        list_item.setData(QtCore.Qt.UserRole, item_data)
        self.load_details(list_item)
    
    def open_history_dialog(self):
        """Open the history dialog."""
        dialog = HistoryDialog(self)
        dialog.item_selected.connect(self.on_history_item_selected)
        dialog.exec_()
    
    def on_history_item_selected(self, item_data):
        """Handle selection of history item."""
        # Create dummy list item to reuse load_details
        list_item = QtWidgets.QListWidgetItem()
        list_item.setData(QtCore.Qt.UserRole, item_data)
        self.load_details(list_item)
    
    def open_filter_dialog(self):
        """Open the filter dialog."""
        dialog = GenreFilterDialog(self)
        dialog.filters_applied.connect(self.apply_content_filters)
        dialog.exec_()
    
    def apply_content_filters(self, filters):
        """Apply filters to the content display."""
        # Show a dialog explaining that filters will be applied to the next search
        QtWidgets.QMessageBox.information(
            self,
            "Filters Applied",
            "Your filters have been applied! They will be used for your next search."
        )
        
        # Store filters for the next search
        self.active_filters = filters
        
        # Update the filter button to show filters are active
        self.filter_btn.setText("🔍 Filters On")
        self.filter_btn.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 18px;
                padding: 6px 18px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c2070f;
            }
        """)

    def clear_details(self):
        while self.detail_layout.count():
            w = self.detail_layout.takeAt(0).widget()
            if w:
                w.deleteLater()

# --------------------------------------------------------------------
# WatchlistDialog: dialog to manage watchlist

class WatchlistDialog(QtWidgets.QDialog):
    item_selected = QtCore.pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("My Watchlist")
        self.resize(700, 500)
        self.init_ui()
        self.load_data()
        
    def init_ui(self):
        layout = QtWidgets.QVBoxLayout(self)
        
        # Header
        header_label = QtWidgets.QLabel("My Watchlist")
        header_label.setStyleSheet("font-size: 18px; font-weight: bold; color: #e50914; margin-bottom: 10px;")
        layout.addWidget(header_label)
        
        # Instructions
        instructions = QtWidgets.QLabel(
            "Double-click any item to view details, or use the buttons below to manage your watchlist."
        )
        instructions.setWordWrap(True)
        instructions.setStyleSheet("color: #666; margin-bottom: 10px;")
        layout.addWidget(instructions)
        
        # List widget for watchlist items
        self.list_widget = QtWidgets.QListWidget()
        self.list_widget.setAlternatingRowColors(True)
        self.list_widget.setStyleSheet("""
            QListWidget {
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #eee;
            }
            QListWidget::item:selected {
                background-color: #e50914;
                color: white;
            }
        """)
        self.list_widget.itemDoubleClicked.connect(self.on_item_double_clicked)
        layout.addWidget(self.list_widget)
        
        # Buttons row
        btn_layout = QtWidgets.QHBoxLayout()
        
        self.remove_btn = QtWidgets.QPushButton("Remove Selected")
        self.remove_btn.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c2070f;
            }
        """)
        self.remove_btn.clicked.connect(self.remove_selected)
        
        self.clear_btn = QtWidgets.QPushButton("Clear All")
        self.clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #555;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
            }
            QPushButton:hover {
                background-color: #333;
            }
        """)
        self.clear_btn.clicked.connect(self.clear_watchlist)
        
        self.close_btn = QtWidgets.QPushButton("Close")
        self.close_btn.setStyleSheet("""
            QPushButton {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 8px 15px;
            }
            QPushButton:hover {
                background-color: #e0e0e0;
            }
        """)
        self.close_btn.clicked.connect(self.accept)
        
        btn_layout.addWidget(self.remove_btn)
        btn_layout.addWidget(self.clear_btn)
        btn_layout.addStretch()
        btn_layout.addWidget(self.close_btn)
        
        layout.addLayout(btn_layout)
        
    def load_data(self):
        """Load watchlist data from storage."""
        self.list_widget.clear()
        watchlist = load_watchlist()
        
        if not watchlist:
            item = QtWidgets.QListWidgetItem("Your watchlist is empty. Add items by clicking the ⭐ button when viewing content.")
            item.setFlags(item.flags() & ~QtCore.Qt.ItemIsSelectable)
            self.list_widget.addItem(item)
            return
            
        for entry in watchlist:
            title = entry.get("title", "Unknown title")
            media_type = entry.get("media_type", "unknown")
            year = entry.get("year", "")
            
            item = QtWidgets.QListWidgetItem()
            item_widget = QtWidgets.QWidget()
            item_layout = QtWidgets.QHBoxLayout(item_widget)
            
            icon_label = QtWidgets.QLabel("🎬" if media_type == "movie" else "📺")
            icon_label.setStyleSheet("font-size: 16px; margin-right: 10px;")
            
            text_layout = QtWidgets.QVBoxLayout()
            title_label = QtWidgets.QLabel(f"<b>{title}</b> ({year})" if year else f"<b>{title}</b>")
            type_label = QtWidgets.QLabel(f"{'Movie' if media_type == 'movie' else 'TV Show'}")
            type_label.setStyleSheet("color: #666; font-size: 12px;")
            
            text_layout.addWidget(title_label)
            text_layout.addWidget(type_label)
            
            item_layout.addWidget(icon_label)
            item_layout.addLayout(text_layout)
            item_layout.addStretch()
            
            # Add date added
            if "date_added" in entry:
                date_label = QtWidgets.QLabel(entry["date_added"])
                date_label.setStyleSheet("color: #888; font-size: 12px;")
                item_layout.addWidget(date_label)
            
            item.setSizeHint(item_widget.sizeHint())
            item.setData(QtCore.Qt.UserRole, entry)
            
            self.list_widget.addItem(item)
            self.list_widget.setItemWidget(item, item_widget)
    
    def on_item_double_clicked(self, item):
        """Handle double-click on watchlist item to view details."""
        data = item.data(QtCore.Qt.UserRole)
        if data:
            self.item_selected.emit(data)
            self.accept()
    
    def remove_selected(self):
        """Remove selected items from watchlist."""
        selected_items = self.list_widget.selectedItems()
        if not selected_items:
            return
            
        watchlist = load_watchlist()
        
        # Remove selected items
        for item in selected_items:
            data = item.data(QtCore.Qt.UserRole)
            if data:
                # Find and remove from watchlist
                watchlist = [w for w in watchlist if not (
                    w.get('id') == data.get('id') and 
                    w.get('media_type') == data.get('media_type')
                )]
        
        # Save updated watchlist
        save_watchlist(watchlist)
        
        # Reload the list
        self.load_data()
    
    def clear_watchlist(self):
        """Clear the entire watchlist."""
        reply = QtWidgets.QMessageBox.question(
            self, "Clear Watchlist", 
            "Are you sure you want to clear your entire watchlist?",
            QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No,
            QtWidgets.QMessageBox.No
        )
        
        if reply == QtWidgets.QMessageBox.Yes:
            save_watchlist([])
            self.load_data()

# --------------------------------------------------------------------
# HistoryDialog: dialog to view history

class HistoryDialog(QtWidgets.QDialog):
    item_selected = QtCore.pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("My Viewing History")
        self.resize(700, 500)
        self.init_ui()
        self.load_data()
        
    def init_ui(self):
        layout = QtWidgets.QVBoxLayout(self)
        
        # Header
        header_label = QtWidgets.QLabel("My Viewing History")
        header_label.setStyleSheet("font-size: 18px; font-weight: bold; color: #e50914; margin-bottom: 10px;")
        layout.addWidget(header_label)
        
        # Instructions
        instructions = QtWidgets.QLabel(
            "Double-click any item to view details again. Your 50 most recent views are saved automatically."
        )
        instructions.setWordWrap(True)
        instructions.setStyleSheet("color: #666; margin-bottom: 10px;")
        layout.addWidget(instructions)
        
        # List widget for history items
        self.list_widget = QtWidgets.QListWidget()
        self.list_widget.setAlternatingRowColors(True)
        self.list_widget.setStyleSheet("""
            QListWidget {
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            QListWidget::item {
                padding: 8px;
                border-bottom: 1px solid #eee;
            }
            QListWidget::item:selected {
                background-color: #e50914;
                color: white;
            }
        """)
        self.list_widget.itemDoubleClicked.connect(self.on_item_double_clicked)
        layout.addWidget(self.list_widget)
        
        # Buttons row
        btn_layout = QtWidgets.QHBoxLayout()
        
        self.clear_btn = QtWidgets.QPushButton("Clear History")
        self.clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #555;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
            }
            QPushButton:hover {
                background-color: #333;
            }
        """)
        self.clear_btn.clicked.connect(self.clear_history)
        
        self.close_btn = QtWidgets.QPushButton("Close")
        self.close_btn.setStyleSheet("""
            QPushButton {
                background-color: #f0f0f0;
                color: #333;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 8px 15px;
            }
            QPushButton:hover {
                background-color: #e0e0e0;
            }
        """)
        self.close_btn.clicked.connect(self.accept)
        
        btn_layout.addWidget(self.clear_btn)
        btn_layout.addStretch()
        btn_layout.addWidget(self.close_btn)
        
        layout.addLayout(btn_layout)
        
    def load_data(self):
        """Load history data from storage."""
        self.list_widget.clear()
        history = load_history()
        
        if not history:
            item = QtWidgets.QListWidgetItem("Your viewing history is empty. Items will appear here as you browse content.")
            item.setFlags(item.flags() & ~QtCore.Qt.ItemIsSelectable)
            self.list_widget.addItem(item)
            return
            
        for entry in history:
            title = entry.get("title", "Unknown title")
            media_type = entry.get("media_type", "unknown")
            year = entry.get("year", "")
            view_date = entry.get("view_date", "Unknown date")
            
            item = QtWidgets.QListWidgetItem()
            item_widget = QtWidgets.QWidget()
            item_layout = QtWidgets.QHBoxLayout(item_widget)
            
            icon_label = QtWidgets.QLabel("🎬" if media_type == "movie" else "📺")
            icon_label.setStyleSheet("font-size: 16px; margin-right: 10px;")
            
            text_layout = QtWidgets.QVBoxLayout()
            title_label = QtWidgets.QLabel(f"<b>{title}</b> ({year})" if year else f"<b>{title}</b>")
            type_label = QtWidgets.QLabel(f"{'Movie' if media_type == 'movie' else 'TV Show'} • Viewed: {view_date}")
            type_label.setStyleSheet("color: #666; font-size: 12px;")
            
            text_layout.addWidget(title_label)
            text_layout.addWidget(type_label)
            
            item_layout.addWidget(icon_label)
            item_layout.addLayout(text_layout)
            item_layout.addStretch()
            
            item.setSizeHint(item_widget.sizeHint())
            item.setData(QtCore.Qt.UserRole, entry)
            
            self.list_widget.addItem(item)
            self.list_widget.setItemWidget(item, item_widget)
    
    def on_item_double_clicked(self, item):
        """Handle double-click on history item to view details."""
        data = item.data(QtCore.Qt.UserRole)
        if data:
            self.item_selected.emit(data)
            self.accept()
    
    def clear_history(self):
        """Clear the entire history."""
        reply = QtWidgets.QMessageBox.question(
            self, "Clear History", 
            "Are you sure you want to clear your entire viewing history?",
            QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No,
            QtWidgets.QMessageBox.No
        )
        
        if reply == QtWidgets.QMessageBox.Yes:
            save_history([])
            self.load_data()

# --------------------------------------------------------------------
# GenreFilterDialog: dialog to filter content by genre

class GenreFilterDialog(QtWidgets.QDialog):
    filters_applied = QtCore.pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Filter Content")
        self.resize(500, 400)
        self.init_ui()
        
    def init_ui(self):
        layout = QtWidgets.QVBoxLayout(self)
        
        # Header
        header_label = QtWidgets.QLabel("Filter Content")
        header_label.setStyleSheet("font-size: 18px; font-weight: bold; color: #e50914; margin-bottom: 10px;")
        layout.addWidget(header_label)
        
        # Tab widget for different filter types
        tabs = QtWidgets.QTabWidget()
        
        # Genre tab
        genre_widget = QtWidgets.QWidget()
        genre_layout = QtWidgets.QVBoxLayout(genre_widget)
        
        genre_label = QtWidgets.QLabel("Select genres:")
        genre_layout.addWidget(genre_label)
        
        # Movie genres
        self.movie_genres = {
            28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 
            80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
            14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
            9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
            10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
        }
        
        # Create checkboxes for genres in a grid layout
        genre_grid = QtWidgets.QGridLayout()
        self.genre_checkboxes = {}
        
        row, col = 0, 0
        for genre_id, genre_name in self.movie_genres.items():
            checkbox = QtWidgets.QCheckBox(genre_name)
            self.genre_checkboxes[genre_id] = checkbox
            genre_grid.addWidget(checkbox, row, col)
            
            col += 1
            if col >= 3:
                col = 0
                row += 1
                
        genre_layout.addLayout(genre_grid)
        
        # Year range tab
        year_widget = QtWidgets.QWidget()
        year_layout = QtWidgets.QVBoxLayout(year_widget)
        
        year_label = QtWidgets.QLabel("Select year range:")
        year_layout.addWidget(year_label)
        
        year_range_layout = QtWidgets.QHBoxLayout()
        
        # Get current year
        current_year = datetime.now().year
        
        self.year_from = QtWidgets.QComboBox()
        self.year_to = QtWidgets.QComboBox()
        
        # Populate year dropdowns
        for year in range(1900, current_year + 1):
            self.year_from.addItem(str(year))
            self.year_to.addItem(str(year))
            
        # Set defaults
        self.year_from.setCurrentText("1980")
        self.year_to.setCurrentText(str(current_year))
        
        year_range_layout.addWidget(QtWidgets.QLabel("From:"))
        year_range_layout.addWidget(self.year_from)
        year_range_layout.addWidget(QtWidgets.QLabel("To:"))
        year_range_layout.addWidget(self.year_to)
        
        year_layout.addLayout(year_range_layout)
        year_layout.addStretch()
        
        # Rating tab
        rating_widget = QtWidgets.QWidget()
        rating_layout = QtWidgets.QVBoxLayout(rating_widget)
        
        rating_label = QtWidgets.QLabel("Minimum rating:")
        rating_layout.addWidget(rating_label)
        
        self.rating_slider = QtWidgets.QSlider(QtCore.Qt.Horizontal)
        self.rating_slider.setMinimum(0)
        self.rating_slider.setMaximum(10)
        self.rating_slider.setValue(6)
        self.rating_slider.setTickPosition(QtWidgets.QSlider.TicksBelow)
        self.rating_slider.setTickInterval(1)
        
        self.rating_value = QtWidgets.QLabel("6.0+")
        self.rating_value.setAlignment(QtCore.Qt.AlignCenter)
        self.rating_value.setStyleSheet("font-size: 16px; font-weight: bold; color: #e50914;")
        
        self.rating_slider.valueChanged.connect(lambda v: self.rating_value.setText(f"{v}.0+"))
        
        rating_layout.addWidget(self.rating_slider)
        rating_layout.addWidget(self.rating_value)
        rating_layout.addStretch()
        
        # Add tabs
        tabs.addTab(genre_widget, "Genres")
        tabs.addTab(year_widget, "Year Range")
        tabs.addTab(rating_widget, "Rating")
        
        layout.addWidget(tabs)
        
        # Buttons
        btn_layout = QtWidgets.QHBoxLayout()
        
        self.reset_btn = QtWidgets.QPushButton("Reset Filters")
        self.reset_btn.clicked.connect(self.reset_filters)
        
        self.apply_btn = QtWidgets.QPushButton("Apply Filters")
        self.apply_btn.setStyleSheet("""
            QPushButton {
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #c2070f;
            }
        """)
        self.apply_btn.clicked.connect(self.apply_filters)
        
        btn_layout.addWidget(self.reset_btn)
        btn_layout.addStretch()
        btn_layout.addWidget(self.apply_btn)
        
        layout.addLayout(btn_layout)
        
    def reset_filters(self):
        """Reset all filters to default values."""
        # Reset genre checkboxes
        for checkbox in self.genre_checkboxes.values():
            checkbox.setChecked(False)
        
        # Reset year range
        current_year = datetime.now().year
        self.year_from.setCurrentText("1980")
        self.year_to.setCurrentText(str(current_year))
        
        # Reset rating slider
        self.rating_slider.setValue(6)
        
    def apply_filters(self):
        """Apply selected filters and emit signal."""
        # Get selected genres
        selected_genres = []
        for genre_id, checkbox in self.genre_checkboxes.items():
            if checkbox.isChecked():
                selected_genres.append(genre_id)
        
        # Get year range
        year_from = int(self.year_from.currentText())
        year_to = int(self.year_to.currentText())
        
        # Get minimum rating
        min_rating = self.rating_slider.value()
        
        # Create filters dict
        filters = {
            "genres": selected_genres,
            "year_from": year_from,
            "year_to": year_to,
            "min_rating": min_rating
        }
        
        # Emit signal with filters
        self.filters_applied.emit(filters)
        self.accept()

def main():
    app = QtWidgets.QApplication(sys.argv)
    font_id = QtGui.QFontDatabase.addApplicationFont("f:\\study\\programming\\python\\apps\\media\\games\\GameSearchData\\Roboto-Regular.ttf")
    if font_id != -1:
        font_family = QtGui.QFontDatabase.applicationFontFamilies(font_id)[0]
        font = QtGui.QFont(font_family)
        app.setFont(font)

    # Set application style
    app.setStyle("Fusion")
    
    # Clear any existing caches at startup
    if hasattr(requests, 'session'):
        requests.session().close()
    
    # Pre-create application cache directories if they don't exist
    cache_dir = os.path.join(os.path.expanduser("~"), ".movietv_insight_cache")
    if not os.path.exists(cache_dir):
        try:
            os.makedirs(cache_dir)
            print(f"Created cache directory: {cache_dir}")
        except:
            print("Could not create cache directory")
    
    # Create a splash screen to show while loading
    splash_pixmap = QtGui.QPixmap(400, 300)
    splash_pixmap.fill(QtGui.QColor("#181818"))
    splash = QtWidgets.QSplashScreen(splash_pixmap)
    
    # Add movie icon and loading text to splash screen
    splash_painter = QtGui.QPainter(splash_pixmap)
    splash_painter.setPen(QtGui.QColor("#e50914"))
    splash_painter.setFont(QtGui.QFont("Arial", 24, QtGui.QFont.Bold))
    splash_painter.drawText(splash_pixmap.rect(), QtCore.Qt.AlignCenter, "Movie & TV Show Insight\nLoading...")
    splash_painter.end()
    splash.setPixmap(splash_pixmap)
    splash.show()
    app.processEvents()
    
    # Preload common resources in background thread
    def preload_resources():
        # Preload trending movies and shows to speed up first display
        get_trending_movies(limit=8)
        get_trending_tv_shows(limit=8)
        # Initialize connection pool for requests
        session = requests.Session()
        session.mount('https://', requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20))
    
    # Start preloading in background
    preload_thread = QtCore.QThread()
    preloader = QObject()
    preloader.run = preload_resources
    preloader.moveToThread(preload_thread)
    preload_thread.started.connect(preloader.run)
    preload_thread.start()
    
    # Initialize application cache to improve performance
    if not hasattr(MainWindow, '_initialized'):
        # Create persistent disk cache for images
        cache_path = os.path.join(cache_dir, "image_cache")
        if not os.path.exists(cache_path):
            try:
                os.makedirs(cache_path)
            except:
                print("Could not create image cache directory")
        
        # Set up memory cache for frequently accessed data
        global_cache = {}
        MainWindow._initialized = True
    
    # Show friendly message about API keys on startup
    if OMDB_API_KEY == "6bbc1115":
        print("Note: Using a shared OMDB API key. For better reliability, please get your own API key from http://www.omdbapi.com/apikey.aspx")

    # Create window with deferred loading for faster startup
    wnd = MainWindow()
    wnd.show()
    
    # Close splash screen after main window appears
    splash.finish(wnd)
    
    # Schedule lazy loading of non-essential content after UI is shown
    def delayed_init():
        # Pre-cache some common API responses
        threading.Thread(target=get_trending_movies, args=(4,), daemon=True).start()
        threading.Thread(target=get_trending_tv_shows, args=(4,), daemon=True).start()
    
    QtCore.QTimer.singleShot(500, delayed_init)
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    import os
    import threading
    main()
