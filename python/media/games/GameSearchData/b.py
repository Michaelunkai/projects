import sys
import difflib
import requests
import tempfile
import os
from io import BytesIO

from PyQt5 import QtCore, QtGui, QtWidgets
from howlongtobeatpy import HowLongToBeat

# Giant Bomb API configuration
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {
    "User-Agent": "GameInsightToolkit/1.0",
}

# ----------------------------
# Helper functions for Giant Bomb API
# ----------------------------

def search_giantbomb(query):
    """Search Giant Bomb for games matching the query (returns list of dicts)."""
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
        else:
            return []
    except Exception as e:
        print("Error in search_giantbomb:", e)
    return []


def get_giantbomb_details(game_id):
    """Fetch detailed info for a game using its Giant Bomb game id."""
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
    """Search HowLongToBeat for a game query."""
    try:
        results = HowLongToBeat().search(query)
        return results
    except Exception as e:
        print("Error in get_hltb_results:", e)
    return []


def match_hltb_result(gb_name, hltb_results):
    """Fuzzy match the Giant Bomb game name with HowLongToBeat results."""
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
    """Download image data from a URL and return QPixmap (or None on error)."""
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

# ----------------------------
# GUI Classes
# ----------------------------

class DetailTabs(QtWidgets.QTabWidget):
    """Tab widget to show game details, HLTB info, and image."""
    def __init__(self, gb_details, hltb_result, parent=None):
        super().__init__(parent)
        self.gb_details = gb_details
        self.hltb_result = hltb_result
        self.init_tabs()

    def init_tabs(self):
        # Tab 1: Game Details (formatted as HTML)
        detail_widget = QtWidgets.QWidget()
        detail_layout = QtWidgets.QVBoxLayout()
        self.detailText = QtWidgets.QTextBrowser()
        self.detailText.setHtml(self.format_details())
        detail_layout.addWidget(self.detailText)
        detail_widget.setLayout(detail_layout)
        self.addTab(detail_widget, "Game Details")

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

        # Tab 3: Image (if available)
        image_widget = QtWidgets.QWidget()
        image_layout = QtWidgets.QVBoxLayout()
        self.imageLabel = QtWidgets.QLabel()
        self.imageLabel.setAlignment(QtCore.Qt.AlignCenter)
        image_url = self.extract_image_url()
        if image_url:
            pix = fetch_image(image_url)
            if pix:
                # Optionally, scale the image to fit the tab area
                self.imageLabel.setPixmap(pix.scaled(600, 400, QtCore.Qt.KeepAspectRatio))
            else:
                self.imageLabel.setText("Failed to load image.")
        else:
            self.imageLabel.setText("No image available.")
        image_layout.addWidget(self.imageLabel)
        image_widget.setLayout(image_layout)
        self.addTab(image_widget, "Wallpaper")

    def extract_image_url(self):
        """Extract an image URL from the Giant Bomb details (try 'image' field)."""
        if self.gb_details.get("image"):
            # We try for the highest resolution URL available.
            return self.gb_details["image"].get("super_url")
        return None

    def format_details(self):
        """Return formatted HTML details based on Giant Bomb details."""
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
        <h1>{title}</h1>
        <p><i>{deck}</i></p>
        <p><b>Release Date:</b> {release_date}</p>
        <p><b>Platforms:</b> {platforms}</p>
        <p><b>Developers:</b> {developers}</p>
        <p><b>Publishers:</b> {publishers}</p>
        <hr>
        {description}
        """
        return html


class MainWindow(QtWidgets.QMainWindow):
    """Main application window."""
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(800, 600)
        self.init_ui()

    def init_ui(self):
        # Central widget layout
        central_widget = QtWidgets.QWidget()
        layout = QtWidgets.QVBoxLayout()

        # Search area: label, line edit and button.
        form_layout = QtWidgets.QHBoxLayout()
        self.searchLine = QtWidgets.QLineEdit()
        self.searchLine.setPlaceholderText("Enter game name...")
        self.searchButton = QtWidgets.QPushButton("Search")
        self.searchButton.clicked.connect(self.search_games)
        form_layout.addWidget(self.searchLine)
        form_layout.addWidget(self.searchButton)
        layout.addLayout(form_layout)

        # List widget for search results
        self.resultsList = QtWidgets.QListWidget()
        self.resultsList.itemDoubleClicked.connect(self.load_details)
        layout.addWidget(self.resultsList)

        # Tab widget placeholder (for details) below the list
        self.detailTabs = None  # Will be created after a selection
        self.detailArea = QtWidgets.QWidget()
        self.detailAreaLayout = QtWidgets.QVBoxLayout()
        self.detailArea.setLayout(self.detailAreaLayout)
        layout.addWidget(self.detailArea)

        central_widget.setLayout(layout)
        self.setCentralWidget(central_widget)

    def search_games(self):
        """Called when the user clicks 'Search'. Fetch and show Giant Bomb search results."""
        query = self.searchLine.text().strip()
        if not query:
            return

        self.resultsList.clear()
        # Clear previous details if any.
        for i in reversed(range(self.detailAreaLayout.count())):
            widget_to_remove = self.detailAreaLayout.itemAt(i).widget()
            if widget_to_remove:
                widget_to_remove.setParent(None)

        # Search Giant Bomb (blocking network call)
        results = search_giantbomb(query)
        if not results:
            QtWidgets.QMessageBox.warning(self, "No Results", "No games found on Giant Bomb!")
            return

        # Store full result in QListWidgetItem using setData (UserRole)
        for game in results:
            name = game.get("name", "N/A")
            release = game.get("original_release_date", "N/A")
            item_text = f"{name} ({release})"
            item = QtWidgets.QListWidgetItem(item_text)
            item.setData(QtCore.Qt.UserRole, game)
            self.resultsList.addItem(item)

    def load_details(self, item):
        """When the user double-clicks an item, load its detailed info, HLTB, and display in tabs."""
        gb_game = item.data(QtCore.Qt.UserRole)
        game_id = gb_game.get("id")
        # Fetch detailed Giant Bomb info (blocking call)
        gb_details = get_giantbomb_details(game_id)
        if not gb_details:
            QtWidgets.QMessageBox.warning(self, "Error", "Could not load game details.")
            return

        # Get HowLongToBeat data (using the search query from the search line)
        hltb_results = get_hltb_results(self.searchLine.text().strip())
        hltb_match = match_hltb_result(gb_details.get("name", ""), hltb_results)

        # If a previous detail tab exists, remove it.
        for i in reversed(range(self.detailAreaLayout.count())):
            widget_to_remove = self.detailAreaLayout.itemAt(i).widget()
            if widget_to_remove:
                widget_to_remove.setParent(None)

        # Create a new tab widget for the details.
        self.detailTabs = DetailTabs(gb_details, hltb_match)
        self.detailAreaLayout.addWidget(self.detailTabs)


# ----------------------------
# Main application execution
# ----------------------------
def main():
    app = QtWidgets.QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()

