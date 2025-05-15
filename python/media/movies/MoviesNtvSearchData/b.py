import sys
import difflib
import requests
import urllib.parse
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
        table = QtWidgets.QTableWidget()
        
        # Combine TMDB rating with OMDB ratings
        all_ratings = {
            "TMDB": f"{self.details.get('vote_average', 'N/A')}/10",
            "IMDB": self.ratings.get("IMDB", "N/A"),
            "Rotten Tomatoes": self.ratings.get("Rotten Tomatoes", "N/A"),
            "Metacritic": self.ratings.get("Metascore", "N/A") + "/100" if self.ratings.get("Metascore", "N/A") != "N/A" else "N/A"
        }
        
        # Set up the table
        table.setRowCount(len(all_ratings))
        table.setColumnCount(2)
        table.setHorizontalHeaderLabels(["Source", "Rating"])
        table.verticalHeader().setVisible(False)
        table.setShowGrid(True)
        table.setAlternatingRowColors(True)
        
        # Style the table
        table.setStyleSheet("""
            QTableWidget {
                background-color: white;
                border: none;
                border-radius: 10px;
            }
            QTableWidget::item {
                padding: 10px;
                border-bottom: 1px solid #eee;
            }
            QHeaderView::section {
                background-color: #e50914;
                color: white;
                padding: 8px;
                font-weight: bold;
                border: none;
            }
        """)
        
        # Fill the table with data
        row = 0
        for source, score in all_ratings.items():
            source_item = QtWidgets.QTableWidgetItem(source)
            score_item = QtWidgets.QTableWidgetItem(str(score))
            
            # Make the text bold
            font = QtGui.QFont()
            font.setBold(True)
            source_item.setFont(font)
            
            table.setItem(row, 0, source_item)
            table.setItem(row, 1, score_item)
            row += 1
            
        # Let the table take all available space
        table.horizontalHeader().setSectionResizeMode(0, QtWidgets.QHeaderView.Stretch)
        table.horizontalHeader().setSectionResizeMode(1, QtWidgets.QHeaderView.Stretch)
        
        # Reviews section
        reviews_data = self.details.get("reviews", {}).get("results", [])[:3]
        reviews_widget = QtWidgets.QWidget()
        reviews_layout = QtWidgets.QVBoxLayout()
        reviews_label = QtWidgets.QLabel("Recent Reviews")
        reviews_label.setStyleSheet("font-size: 16px; font-weight: bold; color: #e50914; margin-top: 20px;")
        reviews_layout.addWidget(reviews_label)
        
        if reviews_data:
            for review in reviews_data:
                review_frame = QtWidgets.QFrame()
                review_frame.setFrameShape(QtWidgets.QFrame.StyledPanel)
                review_frame.setStyleSheet("""
                    background-color: white;
                    border-radius: 8px;
                    padding: 10px;
                    margin: 5px;
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
        else:
            no_reviews = QtWidgets.QLabel("No reviews available")
            no_reviews.setAlignment(QtCore.Qt.AlignCenter)
            no_reviews.setStyleSheet("color: #888; font-style: italic; margin-top: 10px;")
            reviews_layout.addWidget(no_reviews)
            
        # Create the final widget with combined ratings and reviews
        widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(widget)
        layout.addWidget(table)
        layout.addLayout(reviews_layout)
        return widget
        
    def create_similar_content_tab(self):
        similar = self.details.get("similar", {}).get("results", [])
        recommendations = self.details.get("recommendations", {}).get("results", [])
        
        # Combine similar and recommendations, removing duplicates
        combined = similar + recommendations
        seen = set()
        unique_items = []
        for item in combined:
            item_id = item.get("id")
            if item_id and item_id not in seen:
                seen.add(item_id)
                unique_items.append(item)
        
        # Create scrollable grid of movie/show cards
        scroll_area = QtWidgets.QScrollArea()
        scroll_area.setWidgetResizable(True)
        container = QtWidgets.QWidget()
        grid_layout = QtWidgets.QGridLayout(container)
        grid_layout.setSpacing(15)
        scroll_area.setWidget(container)
        
        if not unique_items:
            label = QtWidgets.QLabel("No similar content available")
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("color: #888; font-style: italic; font-size: 16px;")
            grid_layout.addWidget(label, 0, 0)
        else:
            row, col = 0, 0
            for i, item in enumerate(unique_items[:12]):  # Limit to 12 items
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
        rating_label = QtWidgets.QLabel(f"★ {vote_avg}/10")
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
        # self.watchlist_btn.clicked.connect(self.open_watchlist_dialog)  # Not implemented

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
            
        tabs = DetailTabs(details, ratings)
        self.detail_layout.addWidget(tabs)
        self.progress_bar.setVisible(False)
        
        title = details.get("title", details.get("name", "content"))
        self.statusBar().showMessage(f"Loaded details for {title}")

    def on_detail_error(self, err):
        self.clear_details()
        if self.loading_timer and self.loading_timer.isActive():
            self.loading_timer.stop()
            
        self.progress_bar.setVisible(False)
        self.statusBar().showMessage("Error loading details")
        
        error_widget = QtWidgets.QWidget()
        error_layout = QtWidgets.QVBoxLayout(error_widget)
        
        icon_label = QtWidgets.QLabel("❌")
        icon_label.setAlignment(QtCore.Qt.AlignCenter)
        icon_label.setStyleSheet("font-size: 48px; color: #e50914; margin-bottom: 20px;")
        
        error_text = QtWidgets.QLabel(f"Error loading details: {err}")
        error_text.setAlignment(QtCore.Qt.AlignCenter)
        error_text.setWordWrap(True)
        error_text.setStyleSheet("color: #666; font-size: 16px;")
        retry_button = StyledComponents.create_button("Try Again")
        retry_button.setMaximumWidth(200)
        retry_button.clicked.connect(self.start_search)
        
        error_layout.addStretch(1)
        error_layout.addWidget(icon_label)
        error_layout.addWidget(error_text)
        error_layout.addSpacing(20)
        error_layout.addWidget(retry_button, 0, QtCore.Qt.AlignCenter)
        error_layout.addStretch(1)
        
        self.detail_layout.addWidget(error_widget)
        QtWidgets.QMessageBox.critical(self, "Detail Error", str(err))

    def clear_details(self):
        while self.detail_layout.count():
            w = self.detail_layout.takeAt(0).widget()
            if w:
                w.deleteLater()

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
    
    # Show friendly message about API keys on startup
    if OMDB_API_KEY == "d1816ac":
        print("Note: Using a shared OMDB API key. For better reliability, please get your own API key from http://www.omdbapi.com/apikey.aspx")

    wnd = MainWindow()
    wnd.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    import os
    main()
