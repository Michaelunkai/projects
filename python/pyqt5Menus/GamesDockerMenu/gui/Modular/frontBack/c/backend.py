import os
import json
import subprocess
import requests
from requests.adapters import HTTPAdapter, Retry
from datetime import datetime
from howlongtobeatpy import HowLongToBeat
import re
import time

# Optional word segmentation
try:
    import wordninja
except ImportError:
    wordninja = None

# File paths for persistence
SESSION_FILE = "user_session.json"
SETTINGS_FILE = "tag_settings.json"
TABS_CONFIG_FILE = "tabs_config.json"
BANNED_USERS_FILE = "banned_users.json"
ACTIVE_USERS_FILE = "active_users.json"
CUSTOM_BUTTONS_FILE = "custom_buttons.json"

# Session Persistence
def load_session():
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading session file: {e}")
    return None

def save_session(session_data):
    try:
        with open(SESSION_FILE, "w") as f:
            json.dump(session_data, f)
    except Exception as e:
        print(f"Error saving session file: {e}")

def clear_session():
    if os.path.exists(SESSION_FILE):
        os.remove(SESSION_FILE)

# Settings Persistence
def load_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading settings file: {e}")
    return {}

def save_settings(settings):
    try:
        with open(SETTINGS_FILE, "w") as f:
            json.dump(settings, f)
    except Exception as e:
        print(f"Error saving settings file: {e}")

# Tabs Configuration
DEFAULT_TABS_CONFIG = [
    {"id": "all", "name": "All"},
    {"id": "finished", "name": "Finished"},
    {"id": "mybackup", "name": "MyBackup"},
    {"id": "not_for_me", "name": "Not for me right now"}
]

def load_tabs_config():
    if os.path.exists(TABS_CONFIG_FILE):
        try:
            with open(TABS_CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading tabs config: {e}")
    return DEFAULT_TABS_CONFIG

def save_tabs_config(config):
    try:
        with open(TABS_CONFIG_FILE, "w") as f:
            json.dump(config, f)
    except Exception as e:
        print(f"Error saving tabs config: {e}")

# User Management
def load_banned_users():
    if os.path.exists(BANNED_USERS_FILE):
        try:
            with open(BANNED_USERS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading banned users: {e}")
    return []

def save_banned_users(banned):
    try:
        with open(BANNED_USERS_FILE, "w") as f:
            json.dump(banned, f)
    except Exception as e:
        print(f"Error saving banned users: {e}")

def load_active_users():
    if os.path.exists(ACTIVE_USERS_FILE):
        try:
            with open(ACTIVE_USERS_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading active users: {e}")
    return {}

def save_active_users(users):
    try:
        with open(ACTIVE_USERS_FILE, "w") as f:
            json.dump(users, f)
    except Exception as e:
        print(f"Error saving active users: {e}")

# Custom Buttons
def load_custom_buttons():
    if os.path.exists(CUSTOM_BUTTONS_FILE):
        try:
            with open(CUSTOM_BUTTONS_FILE, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    return []

def save_custom_buttons(buttons):
    try:
        with open(CUSTOM_BUTTONS_FILE, "w") as f:
            json.dump(buttons, f)
    except Exception as e:
        print(f"Error saving custom buttons: {e}")

# Word Segmentation Helper
def normalize_game_title(tag):
    if " " in tag:
        return tag
    if any(c.isupper() for c in tag[1:]):
        return re.sub(r'(?<!^)(?=[A-Z])', ' ', tag).strip()
    if wordninja is not None:
        return " ".join(wordninja.split(tag))
    return tag.title()

# HTTP Session with Retries
session = requests.Session()
retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retries)
session.mount("http://", adapter)
session.mount("https://", adapter)

# Docker Engine Functions
def check_docker_engine():
    try:
        cmd = 'wsl --distribution ubuntu --user root -- bash -lic "docker info"'
        subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
        return True
    except subprocess.CalledProcessError:
        return False

def start_docker_engine():
    if not check_docker_engine():
        print("Docker Engine is not running in WSL.")

def dkill():
    cmds = [
        'docker stop $(docker ps -aq)',
        'docker rm $(docker ps -aq)',
        'docker rmi $(docker images -q)',
        'docker system prune -a --volumes --force',
        'docker network prune --force'
    ]
    for cmd in cmds:
        try:
            wsl_cmd = f'wsl --distribution ubuntu --user root -- bash -lic "{cmd}"'
            subprocess.call(wsl_cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass

# Helper Functions
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
                        return (query, img_response.content)
    except Exception as e:
        print(f"RAWG image fetch error for '{query}': {e}")
    return (query, None)

def update_docker_tag_name(old_alias, new_alias):
    print("Renaming tags on Docker Hub is not supported by the API. Only the local display name (alias) will be updated.")
    return True

def parse_date(date_str):
    try:
        return datetime.fromisoformat(date_str.replace("Z", ""))
    except Exception:
        return datetime.min

def load_time_data(file_path):
    time_data = {}
    try:
        with open(file_path, "r", encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if "–" in line:
                    parts = line.split("–")
                    tag = parts[0].strip().lower()
                    time_val = parts[1].strip()
                    time_data[tag] = time_val
    except Exception as e:
        print(f"Error loading time data: {e}")
    return time_data

def fetch_tags():
    url = "https://hub.docker.com/v2/repositories/michadockermisha/backup/tags?page_size=100"
    tag_list = []
    while url:
        try:
            response = requests.get(url)
            data = response.json()
            for item in data.get("results", []):
                tag_list.append({
                    "name": item["name"],
                    "full_size": item.get("full_size", 0),
                    "last_updated": item.get("last_updated", "")
                })
            url = data.get("next")
        except Exception as e:
            print(f"Error fetching tags: {e}")
            break
    tag_list.sort(key=lambda x: x["name"].lower())
    return tag_list

def perform_docker_login(password):
    try:
        docker_login_cmd = f"docker login -u michadockermisha -p {password}"
        login_cmd = f'wsl --distribution ubuntu --user root -- bash -lic "{docker_login_cmd}"'
        result = subprocess.run(login_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return result.returncode == 0
    except Exception as e:
        print(f"Docker login error: {e}")
        return False

def pull_docker_image(tag):
    pull_cmd = f'wsl --distribution ubuntu --user root -- bash -lic "docker pull michadockermisha/backup:\\"{tag}\\""'
    try:
        subprocess.run(pull_cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=600)
    except subprocess.TimeoutExpired:
        print(f"Timeout pulling image for {tag}")
    except Exception as e:
        print(f"Error pulling image for {tag}: {e}")

def run_docker_command(tag, destination_path):
    docker_cmd = (
        f"docker run -d --pull=always --rm --cpus=4 --memory=8g --memory-swap=12g "
        f"-v '{destination_path}':/games -e DISPLAY=\\$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix "
        f"--name '{tag}' michadockermisha/backup:'{tag}' "
        f"sh -c 'apk add rsync pigz && mkdir -p /games/{tag} && "
        f"rsync -aP --compress-level=1 --compress --numeric-ids --inplace --delete-during --info=progress2 /home/ /games/{tag}'"
    )
    run_cmd = f'wsl --distribution ubuntu --user root -- bash -lic "{docker_cmd}"'
    subprocess.Popen(run_cmd, shell=True)

def get_docker_token(password):
    login_url = "https://hub.docker.com/v2/users/login/"
    login_data = {"username": "michadockermisha", "password": password}
    response = requests.post(login_url, json=login_data)
    if response.status_code == 200 and response.json().get("token"):
        return response.json().get("token")
    return None

def delete_docker_tag(token, tag):
    username = "michadockermisha"
    repo = "backup"
    headers = {"Authorization": f"JWT {token}"}
    delete_url = f"https://hub.docker.com/v2/repositories/{username}/{repo}/tags/{tag}/"
    response = requests.delete(delete_url, headers=headers)
    return response.status_code == 204

def clear_terminal():
    cmd = 'powershell -NoProfile -Command "Clear-Host; [System.Console]::Clear(); cls"'
    try:
        subprocess.run(cmd, shell=True, check=True)
    except Exception as e:
        print(f"Error clearing terminal: {e}")
