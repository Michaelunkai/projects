import sys
import difflib
import requests
import urllib.parse
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView
from howlongtobeatpy import HowLongToBeat

# --------------------------------------------------------------------
# Giant Bomb API configuration and cache
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
HEADERS = {"User-Agent": "GameInsightToolkit/1.0"}
game_details_cache = {}

# --------------------------------------------------------------------
# OpenCritic API configuration
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
        response.raise_for_status()
        data = response.json()
        if data.get("error") == "OK":
            return data.get("results", [])
    except Exception as e:
        print(f"Error searching Giant Bomb: {e}")
    return []

def get_giantbomb_details(game_id):
    """Fetch detailed info for a game from Giant Bomb by ID (using caching)."""
    if game_id in game_details_cache:
        return game_details_cache[game_id]
    url = f"{GIANT_BOMB_BASE_URL}/game/{game_id}/"
    params = {"api_key": GIANT_BOMB_API_KEY, "format": "json"}
    try:
        response = requests.get(url, headers=HEADERS, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("error") == "OK":
            details = data.get("results", {})
            game_details_cache[game_id] = details
            return details
    except Exception as e:
        print(f"Error fetching game details: {e}")
    return {}

def get_hltb_results(query):
    """Search HowLongToBeat for a game query."""
    try:
        return HowLongToBeat().search(query)
    except Exception as e:
        print(f"HLTB error: {e}")
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
    """Query OpenCritic API for a game rating."""
    try:
        params = {"criteria": game_name}
        response = requests.get(OPENCRITIC_SEARCH_URL, headers=OPENCRITIC_HEADERS, params=params, timeout=5)
        response.raise_for_status()
        results = response.json()
        if results and isinstance(results, list) and len(results) > 0:
            best = results[0]
            game_id = best.get("id")
            if game_id:
                details_url = OPENCRITIC_DETAILS_URL.format(game_id)
                response = requests.get(details_url, headers=OPENCRITIC_HEADERS, timeout=5)
                response.raise_for_status()
                details = response.json()
                if details:
                    return {
                        "OpenCritic Score": details.get("topCriticScore", "N/A"),
                        "Percent Recommended": details.get("percentRecommended", "N/A"),
                        "Review Count": details.get("reviewCount", "N/A")
                    }
    except Exception as e:
        print(f"Error in get_opencritic_rating: {e}")
    return {
        "OpenCritic Score": "N/A",
        "Percent Recommended": "N/A",
        "Review Count": "N/A"
    }

def get_all_ratings(game_name):
    """Return a dictionary with ratings from multiple sources."""
    oc = get_opencritic_rating(game_name)
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
        response.raise_for_status()
        pixmap = QtGui.QPixmap()
        pixmap.loadFromData(response.content)
        return pixmap
    except Exception as e:
        print(f"Error downloading image: {e}")
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
            pix = fetch_image(url)
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
# DetailTabs: displays tabs for Details, HowLongToBeat, Gallery, Walkthrough, and Ratings

class DetailTabs(QtWidgets.QTabWidget):
    def __init__(self, gb_details, hltb_result):
        super().__init__()
        self.gb_details = gb_details
        self.hltb_result = hltb_result
        self.setDocumentMode(True)
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

        # Tab 4: Walkthrough
        walkthrough_view = QWebEngineView()
        game_title = self.gb_details.get("name", "")
        query = urllib.parse.quote_plus(f"{game_title} walkthrough full game")
        youtube_url = f"https://www.youtube.com/results?search_query={query}"
        walkthrough_view.setUrl(QUrl(youtube_url))
        self.addTab(walkthrough_view, "Walkthrough")

        # Tab 5: Ratings
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
        <div style="background-color: #f5f7fa; padding: 20px; border-radius: 10px;">
            <h1 style="font-size:32px; color:#6b5ce7; margin-bottom: 10px">{title}</h1>
            <p style="font-size:20px; color:#4f43c2; margin-bottom: 20px"><i>{deck}</i></p>
            <div style="display: flex; background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="flex: 1; padding-right: 10px;">
                    <p><b style="color:#6b5ce7">Release Date:</b> {release_date}</p>
                    <p><b style="color:#6b5ce7">Expected Release Year:</b> {expected_year}</p>
                    <p><b style="color:#6b5ce7">Developers:</b> {devs}</p>
                </div>
                <div style="flex: 1; padding-left: 10px; border-left: 1px solid #eee;">
                    <p><b style="color:#6b5ce7">Publishers:</b> {pubs}</p>
                    <p><b style="color:#6b5ce7">Genres:</b> {genres}</p>
                    <p><b style="color:#6b5ce7">Platforms:</b> {platforms}</p>
                </div>
            </div>
            <p><b style="color:#6b5ce7">Site Detail:</b> <a href="{site_url}" style="color:#4f43c2; text-decoration:none;">{site_url}</a></p>
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <h3 style="color:#6b5ce7; border-bottom: 1px solid #eee; padding-bottom: 10px;">Description</h3>
                {desc}
            </div>
        </div>
        """

    def get_hltb_info(self):
        if self.hltb_result:
            main = self.hltb_result.main_story or "N/A"
            extra = self.hltb_result.main_extra or "N/A"
            comp = self.hltb_result.completionist or "N/A"
            return f"""
            <div style="background-color: #f5f7fa; padding: 20px; border-radius: 10px;">
                <h2 style="color:#6b5ce7; margin-bottom: 20px;">How Long To Beat</h2>
                <div style="display: flex; justify-content: space-between; text-align: center;">
                    <div style="flex: 1; background-color: white; padding: 15px; border-radius: 8px; margin: 0 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="color:#6b5ce7;">Main Story</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #4f43c2;">{main} hours</p>
                    </div>
                    <div style="flex: 1; background-color: white; padding: 15px; border-radius: 8px; margin: 0 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="color:#6b5ce7;">Main + Extras</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #4f43c2;">{extra} hours</p>
                    </div>
                    <div style="flex: 1; background-color: white; padding: 15px; border-radius: 8px; margin: 0 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <h3 style="color:#6b5ce7;">Completionist</h3>
                        <p style="font-size: 24px; font-weight: bold; color: #4f43c2;">{comp} hours</p>
                    </div>
                </div>
            </div>
            """
        return """
        <div style="background-color: #f5f7fa; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color:#6b5ce7; margin-bottom: 20px;">How Long To Beat</h2>
            <p style="font-size: 18px; color: #666;">No data available for this game</p>
        </div>
        """

    def create_gallery(self):
        urls = []
        if self.gb_details.get("image"):
            main_url = self.gb_details["image"].get("super_url")
            icon_url = self.gb_details["image"].get("icon_url")
            if main_url:
                urls.append(main_url)
            if icon_url:
                urls.append(icon_url)
        extra_imgs = self.gb_details.get("images", [])
        for img in extra_imgs:
            u = img.get("super_url")
            if u:
                urls.append(u)
        urls = list(dict.fromkeys(urls)) or [""]
        return GalleryWidget(urls)

    def create_ratings_tab(self):
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
# StyledComponents: custom styled widgets for dark theme

class StyledComponents:
    @staticmethod
    def create_search_box(placeholder="Search..."):
        search_box = QtWidgets.QLineEdit()
        search_box.setPlaceholderText(placeholder)
        search_box.setMinimumHeight(40)
        return search_box

    @staticmethod
    def create_button(text, icon_path=None):
        btn = QtWidgets.QPushButton(text)
        btn.setMinimumHeight(40)
        if icon_path:
            btn.setIcon(QtGui.QIcon(icon_path))
            btn.setIconSize(QtCore.QSize(24, 24))
        return btn

    @staticmethod
    def create_list_widget():
        list_widget = QtWidgets.QListWidget()
        list_widget.setAlternatingRowColors(True)
        return list_widget

    @staticmethod
    def create_shadow(widget):
        shadow = QtWidgets.QGraphicsDropShadowEffect()
        shadow.setBlurRadius(15)
        shadow.setColor(QtGui.QColor(0, 0, 0, 80))
        shadow.setOffset(0, 2)
        widget.setGraphicsEffect(shadow)
        return widget

# --------------------------------------------------------------------
# MainWindow: overall application window

class MainWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Game Insight Toolkit")
        self.resize(1200, 900)
        self.setWindowIcon(QtGui.QIcon("f:\\study\\programming\\python\\apps\\media\\games\\GameSearchData\\icon.png"))
        self.init_ui()
        self.apply_styles()

    def init_ui(self):
        central_widget = QtWidgets.QWidget()
        main_layout = QtWidgets.QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(15)

        # Header with logo
        header_layout = QtWidgets.QHBoxLayout()
        logo_label = QtWidgets.QLabel()
        logo_label.setText("<h1>🎮 Game Insight Toolkit</h1>")
        logo_label.setAlignment(QtCore.Qt.AlignLeft | QtCore.Qt.AlignVCenter)
        header_layout.addWidget(logo_label)
        main_layout.addLayout(header_layout)

        # Search row
        search_container = QtWidgets.QWidget()
        search_container.setObjectName("searchContainer")
        search_layout = QtWidgets.QHBoxLayout(search_container)
        search_layout.setContentsMargins(15, 15, 15, 15)
        self.search_line = StyledComponents.create_search_box("Enter game name to search...")
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
        self.results_list.setMinimumHeight(150)
        results_layout.addWidget(self.results_list)

        # Detail area
        detail_container = QtWidgets.QWidget()
        detail_container.setObjectName("detailsContainer")
        detail_main_layout = QtWidgets.QVBoxLayout(detail_container)
        detail_header = QtWidgets.QLabel("Game Details")
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

    def animate_button(self, expand):
        width = 120 if expand else 100
        self.search_animation.setStartValue(self.search_btn.width())
        self.search_animation.setEndValue(width)
        self.search_animation.start()

    def apply_styles(self):
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f0f2f5;
            }
            #searchContainer, #detailsContainer {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            QLabel#sectionHeader {
                font-size: 18px;
                font-weight: bold;
                color: #333;
                padding: 10px;
                background-color: transparent;
                border-bottom: 1px solid #e0e0e0;
            }
            QLineEdit {
                border: 1px solid #d0d0d0;
                border-radius: 5px;
                padding: 8px;
                font-size: 15px;
                selection-background-color: #6b5ce7;
            }
            QLineEdit:focus {
                border: 1px solid #6b5ce7;
            }
            QPushButton#searchButton {
                background-color: #6b5ce7;
                color: white;
                font-weight: bold;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 15px;
                min-width: 100px;
            }
            QPushButton#searchButton:hover {
                background-color: #5a4cda;
            }
            QPushButton#searchButton:pressed {
                background-color: #4f43c2;
            }
            QListWidget {
                border: 1px solid #e0e0e0;
                border-radius: 5px;
                font-size: 15px;
                padding: 5px;
                background-color: white;
            }
            QListWidget::item {
                border-bottom: 1px solid #f0f0f0;
                padding: 10px;
            }
            QListWidget::item:selected {
                background-color: #6b5ce7;
                color: white;
            }
            QListWidget::item:alternate {
                background-color: #f9f9f9;
            }
            QTabWidget::pane {
                border: 1px solid #e0e0e0;
                border-radius: 5px;
            }
            QTabBar::tab {
                background-color: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-bottom: none;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 8px 12px;
                min-width: 100px;
                font-size: 14px;
            }
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 2px solid #6b5ce7;
                font-weight: bold;
            }
            QTextBrowser {
                border: none;
                font-size: 15px;
                background-color: white;
            }
            QTableWidget {
                border: 1px solid #e0e0e0;
                gridline-color: #f0f0f0;
                border-radius: 5px;
                selection-background-color: #6b5ce7;
            }
            QScrollBar:vertical {
                border: none;
                background: #f0f0f0;
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background: #c0c0c0;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical:hover {
                background: #a0a0a0;
            }
            #statusBar {
                background-color: #6b5ce7;
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
        pulse.setStartValue("background-color: #6b5ce7; color: white;")
        pulse.setEndValue("background-color: #4f43c2; color: white;")
        pulse.start()

        self.search_thread = SearchThread(query)
        self.search_thread.results_signal.connect(self.on_search_results)
        self.search_thread.error_signal.connect(self.on_search_error)
        self.search_thread.start()

    def on_search_results(self, results):
        self.search_btn.setEnabled(True)
        self.search_btn.setText("Search")
        self.search_btn.setStyleSheet("")
        self.progress_bar.setVisible(False)

        if not results:
            self.statusBar().showMessage("No games found")
            QtWidgets.QMessageBox.warning(self, "No Results", "No games found on Giant Bomb!")
            return

        self.statusBar().showMessage(f"Found {len(results)} games")
        for g in results:
            name = g.get("name", "N/A")
            rd = g.get("original_release_date", "None")
            item = QtWidgets.QListWidgetItem()
            item.setData(QtCore.Qt.UserRole, g)
            item_text = f"""
                <div style='margin: 2px 0'>
                    <span style='font-weight: bold; color: #6b5ce7;'>{name}</span>
                    <br>
                    <span style='color: #9e9e9e; font-size: 12px;'>Released: {rd}</span>
                </div>
            """
            item.setText(item_text)
            self.results_list.addItem(item)

    def on_search_error(self, err):
        self.search_btn.setEnabled(True)
        self.search_btn.setText("Search")
        self.progress_bar.setVisible(False)
        self.statusBar().showMessage("Search error")
        QtWidgets.QMessageBox.critical(self, "Search Error", err)

    def load_details(self, item):
        game_data = item.data(QtCore.Qt.UserRole)
        if not game_data:
            return

        self.clear_details()
        loading_container = QtWidgets.QWidget()
        loading_layout = QtWidgets.QVBoxLayout(loading_container)
        loading_label = QtWidgets.QLabel("⏳")
        loading_label.setAlignment(QtCore.Qt.AlignCenter)
        loading_label.setStyleSheet("font-size: 32px; color: #6b5ce7;")
        loading_anim = QtCore.QPropertyAnimation(loading_label, b"rotation")
        loading_anim.setDuration(2000)
        loading_anim.setLoopCount(-1)
        loading_anim.setStartValue(0)
        loading_anim.setEndValue(360)
        loading_anim.start()
        loading_text = QtWidgets.QLabel("Loading game details...")
        loading_text.setAlignment(QtCore.Qt.AlignCenter)
        loading_text.setStyleSheet("font-size: 18px; color: #6b5ce7; margin-top: 10px;")
        loading_layout.addStretch(1)
        loading_layout.addWidget(loading_label)
        loading_layout.addWidget(loading_text)
        loading_layout.addStretch(1)
        self.detail_layout.addWidget(loading_container)

        self.statusBar().showMessage("Loading game details...")
        self.progress_bar.setVisible(True)
        game_id = game_data.get("id")
        query = self.search_line.text().strip()
        self.detail_thread = DetailThread(game_id, query)
        self.detail_thread.detail_signal.connect(self.on_detail_results)
        self.detail_thread.error_signal.connect(self.on_detail_error)
        self.detail_thread.start()

    def on_detail_results(self, gb_details, hltb_match):
        self.clear_details()
        tabs = DetailTabs(gb_details, hltb_match)
        self.detail_layout.addWidget(tabs)
        self.progress_bar.setVisible(False)
        self.statusBar().showMessage(f"Loaded details for {gb_details.get('name', 'game')}")

    def on_detail_error(self, err):
        self.clear_details()
        self.progress_bar.setVisible(False)
        self.statusBar().showMessage("Error loading details")
        QtWidgets.QMessageBox.critical(self, "Detail Error", err)

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

    wnd = MainWindow()
    wnd.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()