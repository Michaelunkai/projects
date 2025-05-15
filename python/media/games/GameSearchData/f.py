import sys
import difflib
import requests
import tempfile
import os
from io import BytesIO
import urllib.parse

from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView  # Requires PyQtWebEngine
from howlongtobeatpy import HowLongToBeat

# --------------------------------------------------------------------
# Giant Bomb API configuration
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {
    "User-Agent": "GameInsightToolkit/1.0",
}

# Global cache for game details to speed up repeated loads.
game_details_cache = {}

# --------------------------------------------------------------------
# Helper functions for API calls

def search_giantbomb(query):
    """Search Giant Bomb for games matching the query."""
    search_url = f"{GIANT_BOMB_BASE_URL}/search/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
        "query": query,
        "resources": "game",
        "limit": 20
    }
    try:
        # Reduce timeout to 5 seconds for faster responses
        response = requests.get(search_url, headers=HEADERS, params=params, timeout=5)
        data = response.json()
        if data.get("error") == "OK":
            results = data.get("results", [])
            return results
    except Exception as e:
        print("Error in search_giantbomb:", e)
    return []


def get_giantbomb_details(game_id):
    """Fetch detailed info for a game from Giant Bomb using its ID."""
    # Check cache first
    if game_id in game_details_cache:
        return game_details_cache[game_id]
    details_url = f"{GIANT_BOMB_BASE_URL}/game/{game_id}/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
    }
    try:
        response = requests.get(details_url, headers=HEADERS, params=params, timeout=5)
        data = response.json()
        if data.get("error") == "OK":
            details = data.get("results", {})
            # Save to cache
            game_details_cache[game_id] = details
            return details
    except Exception as e:
        print("Error in get_giantbomb_details:", e)
    return {}


def get_hltb_results(query):
    """Search HowLongToBeat for a game query."""
    try:
        results = HowLongToBeat().search(query)
        return results
    except Exception as e:
        print("Error in get_hltb_results:", e)
    return []


def match_hltb_result(gb_name, hltb_results):
    """Fuzzy match the Giant Bomb game name against HowLongToBeat results."""
    if not hltb_results:
        return None
    hltb_names = [result.game_name for result in hltb_results]
    matches = difflib.get_close_matches(gb_name, hltb_names, n=1, cutoff=0.4)
    if matches:
        for result in hltb_results:
            if result.game_name == matches[0]:
                return result
    return None


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

    def __init__(self, query, parent=None):
        super().__init__(parent)
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

    def __init__(self, game_id, query, parent=None):
        super().__init__(parent)
        self.game_id = game_id
        self.query = query

    def run(self):
        try:
            gb_details = get_giantbomb_details(self.game_id)
            hltb_results = get_hltb_results(self.query)
            hltb_match = match_hltb_result(gb_details.get("name", ""), hltb_results)
            self.detail_signal.emit(gb_details, hltb_match)
        except Exception as e:
            self.error_signal.emit(str(e))

# --------------------------------------------------------------------
# Gallery widget: displays multiple images in a grid

class GalleryWidget(QtWidgets.QWidget):
    def __init__(self, image_urls, parent=None):
        super().__init__(parent)
        self.image_urls = image_urls
        self.init_ui()
    
    def init_ui(self):
        scroll_area = QtWidgets.QScrollArea(self)
        scroll_area.setWidgetResizable(True)
        container = QtWidgets.QWidget()
        self.grid = QtWidgets.QGridLayout()
        self.grid.setSpacing(10)
        container.setLayout(self.grid)
        scroll_area.setWidget(container)
        layout = QtWidgets.QVBoxLayout()
        layout.addWidget(scroll_area)
        self.setLayout(layout)
        self.populate_images()
    
    def populate_images(self):
        row = 0
        col = 0
        for url in self.image_urls:
            pix = fetch_image(url)
            label = QtWidgets.QLabel()
            label.setAlignment(QtCore.Qt.AlignCenter)
            if pix:
                label.setPixmap(pix.scaled(220, 180, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
            else:
                label.setText("No image")
            self.grid.addWidget(label, row, col)
            col += 1
            if col >= 3:
                col = 0
                row += 1

# --------------------------------------------------------------------
# DetailTabs: displays tabs for game details, HowLongToBeat info, gallery, and walkthrough

class DetailTabs(QtWidgets.QTabWidget):
    def __init__(self, gb_details, hltb_result, parent=None):
        super().__init__(parent)
        self.gb_details = gb_details
        self.hltb_result = hltb_result
        self.init_tabs()

    def init_tabs(self):
        # Tab 1: Game Details (HTML formatted)
        detail_widget = QtWidgets.QWidget()
        detail_layout = QtWidgets.QVBoxLayout()
        self.detailText = QtWidgets.QTextBrowser()
        self.detailText.setHtml(self.format_details())
        detail_layout.addWidget(self.detailText)
        detail_widget.setLayout(detail_layout)
        self.addTab(detail_widget, "Details")
        
        # Tab 2: HowLongToBeat Info
        hltb_widget = QtWidgets.QWidget()
        hltb_layout = QtWidgets.QVBoxLayout()
        self.hltbText = QtWidgets.QTextBrowser()
        if self.hltb_result:
            hltb_info = (
                f"<b>Main Story:</b> {self.hltb_result.main_story or 'N/A'} hours<br>"
                f"<b>Main+Extra:</b> {self.hltb_result.main_extra or 'N/A'} hours<br>"
                f"<b>Completionist:</b> {self.hltb_result.completionist or 'N/A'} hours<br>"
            )
        else:
            hltb_info = "No HowLongToBeat data found."
        self.hltbText.setHtml(hltb_info)
        hltb_layout.addWidget(self.hltbText)
        hltb_widget.setLayout(hltb_layout)
        self.addTab(hltb_widget, "HowLongToBeat")
        
        # Tab 3: Gallery
        gallery_widget = self.create_gallery_tab()
        self.addTab(gallery_widget, "Gallery")
        
        # Tab 4: Walkthrough – embed YouTube video search playlist
        walkthrough_view = QWebEngineView()
        game_title = self.gb_details.get("name", "")
        query = urllib.parse.quote(f"{game_title} full walkthrough")
        video_url = f"https://www.youtube.com/embed?listType=search&list={query}"
        walkthrough_view.setUrl(QUrl(video_url))
        self.addTab(walkthrough_view, "Walkthrough")

    def create_gallery_tab(self):
        image_urls = []
        # Main image and icon:
        if self.gb_details.get("image"):
            main_img = self.gb_details["image"].get("super_url")
            icon_img = self.gb_details["image"].get("icon_url")
            if main_img:
                image_urls.append(main_img)
            if icon_img:
                image_urls.append(icon_img)
        # Extra images:
        extra_images = self.gb_details.get("images", [])
        for img in extra_images:
            url = img.get("super_url")
            if url:
                image_urls.append(url)
        # Remove duplicates:
        image_urls = list(dict.fromkeys(image_urls))
        if not image_urls:
            image_urls.append("")  # placeholder
        gallery = GalleryWidget(image_urls)
        return gallery

    def format_details(self):
        """Format as HTML all available data from Giant Bomb details."""
        title = self.gb_details.get("name", "N/A")
        deck = self.gb_details.get("deck", "No summary available.")
        description = self.gb_details.get("description", "No description available.")
        release_date = self.gb_details.get("original_release_date", "N/A")
        platforms = "N/A"
        if self.gb_details.get("platforms"):
            platforms = ", ".join([p.get("name", "") for p in self.gb_details.get("platforms")])
        developers = "N/A"
        if self.gb_details.get("developers"):
            developers = ", ".join([d.get("name", "") for d in self.gb_details.get("developers")])
        publishers = "N/A"
        if self.gb_details.get("publishers"):
            publishers = ", ".join([p.get("name", "") for p in self.gb_details.get("publishers")])
        genres = "N/A"
        if self.gb_details.get("genres"):
            genres = ", ".join([g.get("name", "") for g in self.gb_details.get("genres")])
        site_url = self.gb_details.get("site_detail_url", "N/A")
        expected_year = self.gb_details.get("expected_release_year", "N/A")
        
        html = f"""
        <h1 style="font-size:32px; color:#ff4d4d">{title}</h1>
        <p style="font-size:20px; color:#b30000"><i>{deck}</i></p>
        <p><b>Release Date:</b> {release_date}</p>
        <p><b>Expected Release Year:</b> {expected_year}</p>
        <p><b>Platforms:</b> {platforms}</p>
        <p><b>Developers:</b> {developers}</p>
        <p><b>Publishers:</b> {publishers}</p>
        <p><b>Genres:</b> {genres}</p>
        <p><b>Detail Page:</b> <a href="{site_url}">{site_url}</a></p>
        <hr>
        {description}
        """
        return html

# --------------------------------------------------------------------
# MainWindow: the main application window

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(1100, 850)
        self.init_ui()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout()
        
        # Search row
        search_layout = QtWidgets.QHBoxLayout()
        self.searchLine = QtWidgets.QLineEdit()
        self.searchLine.setPlaceholderText("Enter game name...")
        self.searchLine.returnPressed.connect(self.start_search)  # Enable Enter key search
        self.searchButton = QtWidgets.QPushButton("Search")
        self.searchButton.clicked.connect(self.start_search)
        search_layout.addWidget(self.searchLine)
        search_layout.addWidget(self.searchButton)
        main_layout.addLayout(search_layout)
        
        # Results list
        self.resultsList = QtWidgets.QListWidget()
        self.resultsList.itemDoubleClicked.connect(self.start_detail_load)
        main_layout.addWidget(self.resultsList, 2)
        
        # Detail area: container for tabbed details
        self.detailArea = QtWidgets.QWidget()
        self.detailLayout = QtWidgets.QVBoxLayout()
        self.detailArea.setLayout(self.detailLayout)
        main_layout.addWidget(self.detailArea, 3)
        
        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

        # Apply new style: darker red background and bold, larger fonts
        self.setStyleSheet("""
            QMainWindow { background-color: #ffd9d9; }
            QListWidget { font-size: 18px; padding: 8px; }
            QTextBrowser { font-size: 16px; }
            QPushButton { background-color: #ff4d4d; color: white; padding: 10px; border-radius: 6px; font-size: 16px; font-weight: bold; }
            QPushButton:hover { background-color: #ff6666; }
            QLineEdit { padding: 8px; font-size: 16px; }
        """)
    
    def start_search(self):
        query = self.searchLine.text().strip()
        if not query:
            return
        self.resultsList.clear()
        self.clear_detail_area()
        self.searchButton.setEnabled(False)
        self.searchThread = SearchThread(query)
        self.searchThread.results_signal.connect(self.handle_search_results)
        self.searchThread.error_signal.connect(self.handle_search_error)
        self.searchThread.start()
    
    def handle_search_results(self, results):
        self.searchButton.setEnabled(True)
        if not results:
            QtWidgets.QMessageBox.warning(self, "No Results", "No games found on Giant Bomb!")
            return
        for game in results:
            name = game.get("name", "N/A")
            release = game.get("original_release_date", "N/A")
            item_text = f"{name} ({release})"
            item = QtWidgets.QListWidgetItem(item_text)
            item.setData(QtCore.Qt.UserRole, game)
            self.resultsList.addItem(item)
    
    def handle_search_error(self, error_str):
        self.searchButton.setEnabled(True)
        QtWidgets.QMessageBox.critical(self, "Search Error", error_str)
    
    def start_detail_load(self, item):
        gb_game = item.data(QtCore.Qt.UserRole)
        game_id = gb_game.get("id")
        self.clear_detail_area()
        self.detailThread = DetailThread(game_id, self.searchLine.text().strip())
        self.detailThread.detail_signal.connect(self.handle_detail_results)
        self.detailThread.error_signal.connect(self.handle_detail_error)
        self.detailThread.start()

    def handle_detail_results(self, gb_details, hltb_match):
        detail_tabs = DetailTabs(gb_details, hltb_match)
        self.detailLayout.addWidget(detail_tabs)

    def handle_detail_error(self, error_str):
        QtWidgets.QMessageBox.critical(self, "Detail Error", error_str)
    
    def clear_detail_area(self):
        for i in reversed(range(self.detailLayout.count())):
            widget_to_remove = self.detailLayout.itemAt(i).widget()
            if widget_to_remove:
                widget_to_remove.deleteLater()

# --------------------------------------------------------------------
# Main execution

def main():
    app = QtWidgets.QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()

