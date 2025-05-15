import sys
import difflib
import requests
import tempfile
import os
from io import BytesIO

from PyQt5 import QtCore, QtGui, QtWidgets
from howlongtobeatpy import HowLongToBeat

# --------------------------------------------------------------------
# Giant Bomb API configuration
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {
    "User-Agent": "GameInsightToolkit/1.0",
}

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
        response = requests.get(search_url, headers=HEADERS, params=params, timeout=10)
        data = response.json()
        if data.get("error") == "OK":
            results = data.get("results", [])
            return results
    except Exception as e:
        print("Error in search_giantbomb:", e)
    return []


def get_giantbomb_details(game_id):
    """Fetch detailed info for a game from Giant Bomb using its ID."""
    details_url = f"{GIANT_BOMB_BASE_URL}/game/{game_id}/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
    }
    try:
        response = requests.get(details_url, headers=HEADERS, params=params, timeout=10)
        data = response.json()
        if data.get("error") == "OK":
            return data.get("results", {})
    except Exception as e:
        print("Error in get_giantbomb_details:", e)
    return {}


def get_hltb_results(query):
    """Search HowLongToBeat data for the game query."""
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
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.content
            pixmap = QtGui.QPixmap()
            pixmap.loadFromData(data)
            return pixmap
    except Exception as e:
        print("Error downloading image:", e)
    return None

# --------------------------------------------------------------------
# Gallery widget: displays multiple images (wallpapers, icons) in a grid

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
                # Scale the image to 200x150 keeping aspect ratio
                label.setPixmap(pix.scaled(200, 150, QtCore.Qt.KeepAspectRatio, QtCore.Qt.SmoothTransformation))
            else:
                label.setText("Image not available")
            self.grid.addWidget(label, row, col)
            col += 1
            if col >= 3:
                col = 0
                row += 1

# --------------------------------------------------------------------
# DetailTabs: displays three tabs with game details, HLTB info, and image gallery

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
        
        # Tab 2: HowLongToBeat info
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
        
        # Tab 3: Gallery: show multiple wallpapers and icons
        gallery_widget = self.create_gallery_tab()
        self.addTab(gallery_widget, "Gallery")
    
    def create_gallery_tab(self):
        # Create a list of image URLs. We'll grab the main image and, if available, any extra images in the "images" field.
        image_urls = []
        # Main image from 'image' field:
        if self.gb_details.get("image"):
            main_img = self.gb_details["image"].get("super_url")
            icon_img = self.gb_details["image"].get("icon_url")
            if main_img:
                image_urls.append(main_img)
            if icon_img:
                image_urls.append(icon_img)
        # Additional images, if provided, in the "images" field.
        extra_images = self.gb_details.get("images", [])
        for img in extra_images:
            url = img.get("super_url")
            if url:
                image_urls.append(url)
        # Remove duplicates
        image_urls = list(dict.fromkeys(image_urls))
        if not image_urls:
            image_urls.append("")  # Will show "No image available" in gallery
        gallery = GalleryWidget(image_urls)
        return gallery

    def format_details(self):
        """Format details from Giant Bomb data as HTML."""
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
            
        html = f"""
        <h1 style="color:#2E8B57">{title}</h1>
        <p><i style="color:gray">{deck}</i></p>
        <p><b>Release Date:</b> {release_date}</p>
        <p><b>Platforms:</b> {platforms}</p>
        <p><b>Developers:</b> {developers}</p>
        <p><b>Publishers:</b> {publishers}</p>
        <hr>
        {description}
        """
        return html

# --------------------------------------------------------------------
# MainWindow: the polished main window with search, results, and details

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(1000, 800)
        self.setStyleSheet("""
            QMainWindow { background-color: #f0f0f0; }
            QListWidget { font-size: 14px; padding: 5px; }
            QTextBrowser { font-size: 13px; }
            QPushButton { background-color: #2E8B57; color: white; padding: 8px; border-radius: 4px; }
            QPushButton:hover { background-color: #3CB371; }
            QLineEdit { padding: 6px; font-size: 14px; }
        """)
        self.init_ui()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout()

        # Search row
        search_layout = QtWidgets.QHBoxLayout()
        self.searchLine = QtWidgets.QLineEdit()
        self.searchLine.setPlaceholderText("Enter game name...")
        self.searchButton = QtWidgets.QPushButton("Search")
        self.searchButton.clicked.connect(self.search_games)
        search_layout.addWidget(self.searchLine)
        search_layout.addWidget(self.searchButton)
        main_layout.addLayout(search_layout)

        # Results list
        self.resultsList = QtWidgets.QListWidget()
        self.resultsList.itemDoubleClicked.connect(self.load_details)
        main_layout.addWidget(self.resultsList, 2)

        # Detail area (to display tabbed information)
        self.detailArea = QtWidgets.QWidget()
        self.detailLayout = QtWidgets.QVBoxLayout()
        self.detailArea.setLayout(self.detailLayout)
        main_layout.addWidget(self.detailArea, 3)

        central_widget.setLayout(main_layout)
        self.setCentralWidget(central_widget)

    def search_games(self):
        query = self.searchLine.text().strip()
        if not query:
            return

        self.resultsList.clear()
        # Clear previous detail area widgets.
        for i in reversed(range(self.detailLayout.count())):
            widget_to_remove = self.detailLayout.itemAt(i).widget()
            if widget_to_remove:
                widget_to_remove.setParent(None)

        results = search_giantbomb(query)
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

    def load_details(self, item):
        gb_game = item.data(QtCore.Qt.UserRole)
        game_id = gb_game.get("id")
        gb_details = get_giantbomb_details(game_id)
        if not gb_details:
            QtWidgets.QMessageBox.warning(self, "Error", "Could not load game details.")
            return

        hltb_results = get_hltb_results(self.searchLine.text().strip())
        hltb_match = match_hltb_result(gb_details.get("name", ""), hltb_results)

        for i in reversed(range(self.detailLayout.count())):
            widget_to_remove = self.detailLayout.itemAt(i).widget()
            if widget_to_remove:
                widget_to_remove.setParent(None)

        detail_tabs = DetailTabs(gb_details, hltb_match)
        self.detailLayout.addWidget(detail_tabs)

# --------------------------------------------------------------------
# Main execution
def main():
    app = QtWidgets.QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()

