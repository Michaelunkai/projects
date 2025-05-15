import sys
import difflib
import requests
import urllib.parse

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView
from howlongtobeatpy import HowLongToBeat

# --------------------------------------------------------------------
# Giant Bomb API + global caching
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {"User-Agent": "GameInsightToolkit/1.0"}

game_details_cache = {}  # Cache game details to avoid repeated downloads

# --------------------------------------------------------------------
# Faster-timeout requests

def search_giantbomb(query):
    """Search Giant Bomb for games matching 'query'."""
    search_url = f"{GIANT_BOMB_BASE_URL}/search/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
        "query": query,
        "resources": "game",
        "limit": 20
    }
    try:
        response = requests.get(search_url, headers=HEADERS, params=params, timeout=5)
        data = response.json()
        if data.get("error") == "OK":
            return data.get("results", [])
    except Exception as e:
        print("Error searching Giant Bomb:", e)
    return []

def get_giantbomb_details(game_id):
    """Fetch details for a game from Giant Bomb by ID (using cache)."""
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
    """Search HowLongToBeat with the user’s query."""
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

# --------------------------------------------------------------------
# Worker threads for non-blocking network calls

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
# GalleryWidget: a scrollable grid of images

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

        layout = QtWidgets.QVBoxLayout(self)
        layout.addWidget(scroll_area)
        scroll_area.setWidget(container)

        self.populate_images()

    def populate_images(self):
        row, col = 0, 0
        for url in self.image_urls:
            label = QtWidgets.QLabel()
            label.setAlignment(QtCore.Qt.AlignCenter)
            pix = self.fetch_pixmap(url)
            if pix:
                label.setPixmap(pix.scaled(220, 180, QtCore.Qt.KeepAspectRatio,
                                           QtCore.Qt.SmoothTransformation))
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
# DetailTabs: 4 tabs → Details, HowLongToBeat, Gallery, Walkthrough

class DetailTabs(QtWidgets.QTabWidget):
    def __init__(self, gb_details, hltb_result):
        super().__init__()
        self.gb_details = gb_details
        self.hltb_result = hltb_result
        self.init_tabs()

    def init_tabs(self):
        # Details tab
        detail_widget = QtWidgets.QWidget()
        detail_layout = QtWidgets.QVBoxLayout(detail_widget)
        text_browser = QtWidgets.QTextBrowser()
        text_browser.setHtml(self.format_details())
        detail_layout.addWidget(text_browser)
        self.addTab(detail_widget, "Details")

        # HLTB tab
        hltb_widget = QtWidgets.QWidget()
        hltb_layout = QtWidgets.QVBoxLayout(hltb_widget)
        hltb_text = QtWidgets.QTextBrowser()
        hltb_layout.addWidget(hltb_text)
        hltb_info = self.get_hltb_info()
        hltb_text.setHtml(hltb_info)
        self.addTab(hltb_widget, "HowLongToBeat")

        # Gallery tab
        gallery_widget = self.create_gallery()
        self.addTab(gallery_widget, "Gallery")

        # Walkthrough tab
        walkthrough_view = QWebEngineView()
        game_title = self.gb_details.get("name", "")
        # Instead of the old embed approach, just load the search results page
        q = urllib.parse.quote_plus(f"{game_title} full walkthrough")
        youtube_url = f"https://www.youtube.com/results?search_query={q}"
        walkthrough_view.setUrl(QtCore.QUrl(youtube_url))
        self.addTab(walkthrough_view, "Walkthrough")

    def format_details(self):
        """Return HTML with full Giant Bomb data."""
        d = self.gb_details
        title = d.get("name", "N/A")
        deck = d.get("deck", "No summary available.")
        desc = d.get("description", "No description available.")
        release_date = d.get("original_release_date", "N/A")
        expected_year = d.get("expected_release_year", "N/A")

        # Multi-value data
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
            return (
                f"<b>Main Story:</b> {main} hours<br>"
                f"<b>Main+Extra:</b> {extra} hours<br>"
                f"<b>Completionist:</b> {comp} hours<br>"
            )
        else:
            return "No HowLongToBeat data found."

    def create_gallery(self):
        # Gather images
        urls = []
        if self.gb_details.get("image"):
            main_url = self.gb_details["image"].get("super_url")
            icon_url = self.gb_details["image"].get("icon_url")
            if main_url: urls.append(main_url)
            if icon_url: urls.append(icon_url)

        extra_imgs = self.gb_details.get("images", [])
        for img in extra_imgs:
            su = img.get("super_url")
            if su: urls.append(su)

        urls = list(dict.fromkeys(urls))  # deduplicate
        if not urls:
            urls = [""]  # force "No image"
        return GalleryWidget(urls)

# --------------------------------------------------------------------
# MainWindow: Search + Results + Details area

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(1100, 850)
        self.init_ui()

    def init_ui(self):
        # Main layout
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

        # Details area
        self.detail_area = QtWidgets.QWidget()
        self.detail_layout = QtWidgets.QVBoxLayout(self.detail_area)

        # Compose
        main_layout.addLayout(search_layout)
        main_layout.addWidget(self.results_list, 2)
        main_layout.addWidget(self.detail_area, 3)
        self.setCentralWidget(central_widget)

        # Style
        self.setStyleSheet("""
            QMainWindow { background-color: #ffcfcf; }
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
            if w: w.deleteLater()

# --------------------------------------------------------------------
def main():
    app = QtWidgets.QApplication(sys.argv)
    wnd = MainWindow()
    wnd.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()

