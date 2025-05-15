import sys
import difflib
import requests
import urllib.parse

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView  # Requires PyQtWebEngine
from howlongtobeatpy import HowLongToBeat

# --------------------------------------------------------------------
# Giant Bomb API configuration and cache
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {"User-Agent": "GameInsightToolkit/1.0"}

game_details_cache = {}  # Cache for game details

# --------------------------------------------------------------------
# OpenCritic API (for rating) configuration
OPENCRITIC_HEADERS = {
    "x-rapidapi-key": "ec6dc2f95cmsh684f88e61fc1401p1b3a93jsn8f45e1822620",
    "x-rapidapi-host": "opencritic-api.p.rapidapi.com"
}
OPENCRITIC_SEARCH_URL = "https://opencritic-api.p.rapidapi.com/game/search"
OPENCRITIC_DETAILS_URL = "https://opencritic-api.p.rapidapi.com/game/{}"

# --------------------------------------------------------------------
# Helper functions for API calls

def search_giantbomb(query):
    """Search Giant Bomb for games matching 'query'."""
    url = f"{GIANT_BOMB_BASE_URL}/search/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
        "query": query,
        "resources": "game",
        "limit": 20
    }
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=5)
        data = response.json()
        if data.get("error") == "OK":
            return data.get("results", [])
    except Exception as e:
        print("Error searching Giant Bomb:", e)
    return []

def get_giantbomb_details(game_id):
    """Fetch detailed info for a game from Giant Bomb by ID (using caching)."""
    if game_id in game_details_cache:
        return game_details_cache[game_id]
    url = f"{GIANT_BOMB_BASE_URL}/game/{game_id}/"
    params = {"api_key": GIANT_BOMB_API_KEY, "format": "json"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=5)
        data = response.json()
        if data.get("error") == "OK":
            details = data.get("results", {})
            game_details_cache[game_id] = details
            return details
    except Exception as e:
        print("Error fetching game details:", e)
    return {}

def get_hltb_results(query):
    """Search HowLongToBeat for a game query."""
    try:
        return HowLongToBeat().search(query)
    except Exception as e:
        print("HLTB error:", e)
    return []

def match_hltb_result(gb_name, hltb_results):
    """Fuzzy match the chosen game name with HLTB results."""
    if not hltb_results:
        return None
    hltb_names = [r.game_name for r in hltb_results]
    matches = difflib.get_close_matches(gb_name, hltb_names, n=1, cutoff=0.4)
    if matches:
        for r in hltb_results:
            if r.game_name == matches[0]:
                return r
    return None

def get_opencritic_rating(game_name):
    """Query OpenCritic API for a game rating.
       Returns a dictionary with 'topCriticScore', 'percentRecommended', and 'reviewCount'.
    """
    try:
        params = {"criteria": game_name}
        r = requests.get(OPENCRITIC_SEARCH_URL, headers=OPENCRITIC_HEADERS, params=params, timeout=5)
        results = r.json()
        if results and isinstance(results, list) and len(results)>0:
            best = results[0]
            game_id = best.get("id")
            if game_id:
                details_url = OPENCRITIC_DETAILS_URL.format(game_id)
                r2 = requests.get(details_url, headers=OPENCRITIC_HEADERS, timeout=5)
                details = r2.json()
                if details:
                    return {
                        "OpenCritic Score": details.get("topCriticScore", "N/A"),
                        "Percent Recommended": details.get("percentRecommended", "N/A"),
                        "Review Count": details.get("reviewCount", "N/A")
                    }
    except Exception as e:
        print("Error in get_opencritic_rating:", e)
    return {
        "OpenCritic Score": "N/A",
        "Percent Recommended": "N/A",
        "Review Count": "N/A"
    }

def get_all_ratings(game_name):
    """Return a dictionary with ratings from multiple sources.
       Here we use OpenCritic plus placeholders for Metacritic, IGN, and Gamespot.
    """
    oc = get_opencritic_rating(game_name)
    # In a real-world scenario you could add additional API calls to Metacritic, IGN, and Gamespot.
    return {
        "OpenCritic Score": oc.get("OpenCritic Score", "N/A"),
        "Percent Recommended": oc.get("Percent Recommended", "N/A"),
        "Review Count": oc.get("Review Count", "N/A"),
        "Metacritic": "N/A",
        "IGN": "N/A",
        "Gamespot": "N/A"
    }

def fetch_image(url):
    """Download an image and return it as QPixmap."""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.content
            pixmap = QtGui.QPixmap()
            pixmap.loadFromData(data)
            return pixmap
    except Exception as e:
        print("Error downloading image:", e)
    return None

# --------------------------------------------------------------------
# Worker Threads for nonblocking network calls

class SearchThread(QtCore.QThread):
    results_signal = QtCore.pyqtSignal(list)
    error_signal = QtCore.pyqtSignal(str)

    def __init__(self, query):
        super().__init__()
        self.query = query

    def run(self):
        try:
            results = search_giantbomb(self.query)
            self.results_signal.emit(results)
        except Exception as e:
            self.error_signal.emit(str(e))

class DetailThread(QtCore.QThread):
    detail_signal = QtCore.pyqtSignal(dict, object)
    error_signal = QtCore.pyqtSignal(str)

    def __init__(self, game_id, query):
        super().__init__()
        self.game_id = game_id
        self.query = query

    def run(self):
        try:
            details = get_giantbomb_details(self.game_id)
            hltb_data = get_hltb_results(self.query)
            matched = match_hltb_result(details.get("name", ""), hltb_data)
            self.detail_signal.emit(details, matched)
        except Exception as e:
            self.error_signal.emit(str(e))

# --------------------------------------------------------------------
# GalleryWidget: displays a scrollable grid of images

class GalleryWidget(QtWidgets.QWidget):
    def __init__(self, image_urls):
        super().__init__()
        self.image_urls = image_urls
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
        for url in self.image_urls:
            label = QtWidgets.QLabel()
            label.setAlignment(QtCore.Qt.AlignCenter)
            pix = self.fetch_pixmap(url)
            if pix:
                label.setPixmap(pix.scaled(220, 180, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
            else:
                label.setText("No image")
            self.grid.addWidget(label, row, col)
            col += 1
            if col >= 3:
                col = 0
                row += 1

    @staticmethod
    def fetch_pixmap(url):
        try:
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                pm = QtGui.QPixmap()
                pm.loadFromData(resp.content)
                return pm
        except:
            pass
        return None

# --------------------------------------------------------------------
# DetailTabs: displays tabs for Details, HowLongToBeat, Gallery, Walkthrough, and Ratings

class DetailTabs(QtWidgets.QTabWidget):
    def __init__(self, gb_details, hltb_result):
        super().__init__()
        self.gb_details = gb_details
        self.hltb_result = hltb_result
        self.init_tabs()

    def init_tabs(self):
        # Tab 1: Details
        detail_widget = QtWidgets.QWidget()
        detail_layout = QtWidgets.QVBoxLayout(detail_widget)
        text_browser = QtWidgets.QTextBrowser()
        text_browser.setHtml(self.format_details())
        detail_layout.addWidget(text_browser)
        self.addTab(detail_widget, "Details")

        # Tab 2: HowLongToBeat
        hltb_widget = QtWidgets.QWidget()
        hltb_layout = QtWidgets.QVBoxLayout(hltb_widget)
        hltb_text = QtWidgets.QTextBrowser()
        hltb_text.setHtml(self.get_hltb_info())
        hltb_layout.addWidget(hltb_text)
        self.addTab(hltb_widget, "HowLongToBeat")

        # Tab 3: Gallery
        gallery_widget = self.create_gallery()
        self.addTab(gallery_widget, "Gallery")

        # Tab 4: Walkthrough – embed YouTube search results
        walkthrough_view = QWebEngineView()
        game_title = self.gb_details.get("name", "")
        query = urllib.parse.quote_plus(f"{game_title} walkthrough full game")
        youtube_url = f"https://www.youtube.com/results?search_query={query}"
        walkthrough_view.setUrl(QUrl(youtube_url))
        self.addTab(walkthrough_view, "Walkthrough")

        # Tab 5: Ratings (from multiple sources)
        ratings_widget = self.create_ratings_tab()
        self.addTab(ratings_widget, "Ratings")

    def format_details(self):
        d = self.gb_details
        title = d.get("name", "N/A")
        deck = d.get("deck", "No summary available.")
        desc = d.get("description", "No description available.")
        release_date = d.get("original_release_date", "N/A")
        expected_year = d.get("expected_release_year", "N/A")
        platforms = ", ".join(p.get("name", "") for p in d.get("platforms", [])) or "N/A"
        devs = ", ".join(x.get("name", "") for x in d.get("developers", [])) or "N/A"
        pubs = ", ".join(x.get("name", "") for x in d.get("publishers", [])) or "N/A"
        genres = ", ".join(x.get("name", "") for x in d.get("genres", [])) or "N/A"
        site_url = d.get("site_detail_url", "N/A")
        return f"""
        <h1 style="font-size:32px; color:#ff2a2a">{title}</h1>
        <p style="font-size:20px; color:#b30000"><i>{deck}</i></p>
        <p><b>Release Date:</b> {release_date}</p>
        <p><b>Expected Release Year:</b> {expected_year}</p>
        <p><b>Platforms:</b> {platforms}</p>
        <p><b>Developers:</b> {devs}</p>
        <p><b>Publishers:</b> {pubs}</p>
        <p><b>Genres:</b> {genres}</p>
        <p><b>Site Detail:</b> <a href="{site_url}">{site_url}</a></p>
        <hr>
        {desc}
        """

    def get_hltb_info(self):
        if self.hltb_result:
            main = self.hltb_result.main_story or "N/A"
            extra = self.hltb_result.main_extra or "N/A"
            comp = self.hltb_result.completionist or "N/A"
            return (f"<b>Main Story:</b> {main} hours<br>"
                    f"<b>Main+Extra:</b> {extra} hours<br>"
                    f"<b>Completionist:</b> {comp} hours<br>")
        else:
            return "No HowLongToBeat data found."

    def create_gallery(self):
        urls = []
        if self.gb_details.get("image"):
            main_url = self.gb_details["image"].get("super_url")
            icon_url = self.gb_details["image"].get("icon_url")
            if main_url: urls.append(main_url)
            if icon_url: urls.append(icon_url)
        extra_imgs = self.gb_details.get("images", [])
        for img in extra_imgs:
            u = img.get("super_url")
            if u: urls.append(u)
        urls = list(dict.fromkeys(urls))
        if not urls:
            urls = [""]
        return GalleryWidget(urls)

    def create_ratings_tab(self):
        # Retrieve ratings from multiple sources.
        ratings = get_all_ratings(self.gb_details.get("name", ""))
        table = QtWidgets.QTableWidget()
        table.setRowCount(len(ratings))
        table.setColumnCount(2)
        table.setHorizontalHeaderLabels(["Source", "Rating"])
        table.verticalHeader().setVisible(False)
        for i, (source, score) in enumerate(ratings.items()):
            table.setItem(i, 0, QtWidgets.QTableWidgetItem(source))
            table.setItem(i, 1, QtWidgets.QTableWidgetItem(str(score)))
        table.resizeColumnsToContents()
        widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout(widget)
        layout.addWidget(table)
        return widget

# --------------------------------------------------------------------
# Function to get ratings from multiple sources

def get_all_ratings(game_name):
    oc_ratings = get_opencritic_rating(game_name)
    # Here we include placeholders for other sources; in a production app,
    # you might integrate with additional APIs.
    return {
        "OpenCritic Score": oc_ratings.get("OpenCritic Score", "N/A"),
        "Percent Recommended": oc_ratings.get("Percent Recommended", "N/A"),
        "Review Count": oc_ratings.get("Review Count", "N/A"),
        "Metacritic": "N/A",
        "IGN": "N/A",
        "Gamespot": "N/A"
    }

def get_opencritic_rating(game_name):
    try:
        params = {"criteria": game_name}
        r = requests.get(OPENCRITIC_SEARCH_URL, headers=OPENCRITIC_HEADERS, params=params, timeout=5)
        results = r.json()
        if results and isinstance(results, list) and len(results) > 0:
            best = results[0]
            game_id = best.get("id")
            if game_id:
                details_url = OPENCRITIC_DETAILS_URL.format(game_id)
                r2 = requests.get(details_url, headers=OPENCRITIC_HEADERS, timeout=5)
                details = r2.json()
                if details:
                    return {
                        "OpenCritic Score": details.get("topCriticScore", "N/A"),
                        "Percent Recommended": details.get("percentRecommended", "N/A"),
                        "Review Count": details.get("reviewCount", "N/A")
                    }
    except Exception as e:
        print("Error in get_opencritic_rating:", e)
    return {"OpenCritic Score": "N/A", "Percent Recommended": "N/A", "Review Count": "N/A"}

# --------------------------------------------------------------------
# MainWindow: overall application window

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(1100, 850)
        self.init_ui()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout(central_widget)

        # Search row
        search_layout = QtWidgets.QHBoxLayout()
        self.search_line = QtWidgets.QLineEdit()
        self.search_line.setPlaceholderText("Enter game name...")
        self.search_line.returnPressed.connect(self.start_search)
        self.search_btn = QtWidgets.QPushButton("Search")
        self.search_btn.clicked.connect(self.start_search)
        search_layout.addWidget(self.search_line)
        search_layout.addWidget(self.search_btn)

        # Results list
        self.results_list = QtWidgets.QListWidget()
        self.results_list.itemDoubleClicked.connect(self.load_details)

        # Detail area
        self.detail_area = QtWidgets.QWidget()
        self.detail_layout = QtWidgets.QVBoxLayout(self.detail_area)

        main_layout.addLayout(search_layout)
        main_layout.addWidget(self.results_list, 2)
        main_layout.addWidget(self.detail_area, 3)
        self.setCentralWidget(central_widget)

        # New style: beige background, more saturated red buttons
        self.setStyleSheet("""
            QMainWindow { background-color: #f5f5dc; }
            QListWidget { font-size: 18px; padding: 8px; }
            QTextBrowser { font-size: 16px; }
            QPushButton {
                background-color: #ff2a2a;
                color: white;
                padding: 10px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
            }
            QPushButton:hover { background-color: #ff4d4d; }
            QLineEdit { padding: 8px; font-size: 16px; }
        """)

    def start_search(self):
        query = self.search_line.text().strip()
        if not query:
            return
        self.results_list.clear()
        self.clear_details()
        self.search_btn.setEnabled(False)
        self.search_thread = SearchThread(query)
        self.search_thread.results_signal.connect(self.on_search_results)
        self.search_thread.error_signal.connect(self.on_search_error)
        self.search_thread.start()

    def on_search_results(self, results):
        self.search_btn.setEnabled(True)
        if not results:
            QtWidgets.QMessageBox.warning(self, "No Results", "No games found on Giant Bomb!")
            return
        for g in results:
            name = g.get("name", "N/A")
            rd = g.get("original_release_date", "None")
            text = f"{name} ({rd})"
            item = QtWidgets.QListWidgetItem(text)
            item.setData(QtCore.Qt.UserRole, g)
            self.results_list.addItem(item)

    def on_search_error(self, err):
        self.search_btn.setEnabled(True)
        QtWidgets.QMessageBox.critical(self, "Search Error", err)

    def load_details(self, item):
        game_data = item.data(QtCore.Qt.UserRole)
        if not game_data:
            return
        self.clear_details()
        game_id = game_data.get("id")
        query = self.search_line.text().strip()
        self.detail_thread = DetailThread(game_id, query)
        self.detail_thread.detail_signal.connect(self.on_detail_results)
        self.detail_thread.error_signal.connect(self.on_detail_error)
        self.detail_thread.start()

    def on_detail_results(self, gb_details, hltb_match):
        tabs = DetailTabs(gb_details, hltb_match)
        self.detail_layout.addWidget(tabs)

    def on_detail_error(self, err):
        QtWidgets.QMessageBox.critical(self, "Detail Error", err)

    def clear_details(self):
        while self.detail_layout.count():
            w = self.detail_layout.takeAt(0).widget()
            if w:
                w.deleteLater()

# --------------------------------------------------------------------
def main():
    app = QtWidgets.QApplication(sys.argv)
    wnd = MainWindow()
    wnd.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()

