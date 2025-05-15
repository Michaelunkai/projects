import difflib
import requests
import tempfile
import os
from howlongtobeatpy import HowLongToBeat
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt
from rich.text import Text
from rich import box

# Use Rich’s Image class if available (for wallpaper display)
try:
    from rich.image import Image as RichImage
except ImportError:
    RichImage = None

# --------------------------------------------------------------------
# Giant Bomb API configuration (using your provided API key)
GIANT_BOMB_API_KEY = "10376c246078c795ea8e673189e57fcc6d0f74ac"
GIANT_BOMB_BASE_URL = "https://www.giantbomb.com/api"
# Requests to Giant Bomb require a User-Agent header and parameters like format=json
HEADERS = {
    "User-Agent": "GameInsightToolkit/1.0",
}

# Rich console for formatted output
console = Console()

# --------------------------------------------------------------------
# Functions for Giant Bomb API integration

def search_giantbomb(query):
    """
    Search for games via the Giant Bomb API.
    Returns a list of matching game results (as dictionaries).
    """
    search_url = f"{GIANT_BOMB_BASE_URL}/search/"
    params = {
        "api_key": GIANT_BOMB_API_KEY,
        "format": "json",
        "query": query,
        "resources": "game",  # restrict to game resources
        "limit": 20
    }
    try:
        response = requests.get(search_url, headers=HEADERS, params=params, timeout=10)
        data = response.json()
        if data.get("error") == "OK":
            results = data.get("results", [])
            if results:
                return results
            else:
                console.print("[red]No results found on Giant Bomb.[/red]")
        else:
            console.print(f"[red]Giant Bomb API error: {data.get('error')}[/red]")
    except Exception as e:
        console.print(f"[red]Exception during Giant Bomb search: {e}[/red]")
    return []


def get_giantbomb_details(game_id):
    """
    Retrieve detailed game info from Giant Bomb using the given game ID.
    Returns a dictionary with game details.
    """
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
        else:
            console.print(f"[red]Giant Bomb detail error: {data.get('error')}[/red]")
    except Exception as e:
        console.print(f"[red]Exception fetching game details: {e}[/red]")
    return {}


def choose_gb_game(gb_results):
    """
    If multiple Giant Bomb search results exist, show a selection table.
    Returns the chosen game dictionary.
    """
    if not gb_results:
        return None

    # If there's only one, return it.
    if len(gb_results) == 1:
        return gb_results[0]

    console.print("\n[bold cyan]Multiple Giant Bomb results found:[/bold cyan]")
    table = Table(title="Giant Bomb Search Results", box=box.SIMPLE)
    table.add_column("Index", justify="center")
    table.add_column("Name", style="yellow")
    table.add_column("Deck (Summary)", style="green")
    table.add_column("Release Date", style="magenta")

    for idx, game in enumerate(gb_results):
        name = game.get("name", "N/A")
        deck = game.get("deck", "N/A")
        original_release_date = game.get("original_release_date", "N/A")
        table.add_row(str(idx + 1), name, deck, str(original_release_date))
    
    console.print(table)
    while True:
        choice = Prompt.ask("Choose the correct game number (or type 'exit' to cancel)")
        if choice.lower() in ["exit", "quit"]:
            return None
        try:
            index = int(choice) - 1
            if 0 <= index < len(gb_results):
                return gb_results[index]
        except Exception:
            pass
        console.print("[red]Invalid choice. Please try again.[/red]")


# --------------------------------------------------------------------
# HowLongToBeat integration (for game completion times)

def get_hltb_results(query):
    """
    Uses howlongtobeatpy to search for game results and returns a list.
    """
    try:
        results = HowLongToBeat().search(query)
        return results
    except Exception as e:
        console.print(f"[red]HLTB search error: {e}[/red]")
    return []


def match_hltb_result(gb_game_name, hltb_results):
    """
    Attempt to find the best matching HLTB result based on the Giant Bomb game name.
    Returns the matched HLTB result or None.
    """
    if not hltb_results:
        return None
    
    hltb_names = [result.game_name for result in hltb_results]
    matches = difflib.get_close_matches(gb_game_name, hltb_names, n=1, cutoff=0.4)
    if matches:
        for result in hltb_results:
            if result.game_name == matches[0]:
                return result
    return None


def display_hltb_details(hltb_result):
    """
    Display HowLongToBeat estimates (Main Story, Main + Extra, Completionist) in a table.
    """
    table = Table(title="HowLongToBeat Estimates", box=box.ROUNDED)
    table.add_column("Play Mode", justify="center", style="bold")
    table.add_column("Hours", justify="right", style="bright_magenta")
    
    main_story = str(hltb_result.main_story) if hltb_result.main_story is not None else "N/A"
    main_extra = str(hltb_result.main_extra) if hltb_result.main_extra is not None else "N/A"
    completionist = str(hltb_result.completionist) if hltb_result.completionist is not None else "N/A"

    table.add_row("Main Story", main_story)
    table.add_row("Main + Extra", main_extra)
    table.add_row("Completionist", completionist)
    console.print(table)


# --------------------------------------------------------------------
# Display functions for Giant Bomb details

def display_gb_details(gb_details):
    """
    Displays the detailed Giant Bomb game info in a styled panel.
    Returns the wallpaper image URL (if available).
    """
    # Get various fields from Giant Bomb details.
    title = gb_details.get("name", "N/A")
    deck = gb_details.get("deck", "No summary available.")
    description = gb_details.get("description", "No description available.")
    release_date = gb_details.get("original_release_date", "N/A")
    platforms = ", ".join([p.get("name", "") for p in gb_details.get("platforms", [])]) if gb_details.get("platforms") else "N/A"
    developers = ", ".join([d.get("name", "") for d in gb_details.get("developers", [])]) if gb_details.get("developers") else "N/A"
    publishers = ", ".join([p.get("name", "") for p in gb_details.get("publishers", [])]) if gb_details.get("publishers") else "N/A"
    
    # Some games come with an image; we try to get the original image URL
    image_info = gb_details.get("image", {})
    image_url = image_info.get("super_url")  # 'super_url' holds the high-res image URL

    # Build display text
    info_text = Text()
    info_text.append(f"Title: {title}\n", style="bold yellow")
    info_text.append(f"Summary: {deck}\n", style="green")
    info_text.append(f"Release Date: {release_date}\n", style="magenta")
    info_text.append(f"Platforms: {platforms}\n", style="cyan")
    info_text.append(f"Developers: {developers}\n", style="bright_blue")
    info_text.append(f"Publishers: {publishers}\n", style="blue")
    info_text.append("\nDescription:\n", style="underline")
    info_text.append(f"{description}\n")
    
    panel = Panel(info_text, title="Giant Bomb Game Details", border_style="blue", expand=False)
    console.print(panel)
    
    return image_url


def display_wallpaper(image_url):
    """
    Downloads and displays the game's wallpaper using Rich's image capabilities.
    """
    if not image_url:
        console.print("[yellow]No wallpaper image available.[/yellow]")
        return

    try:
        response = requests.get(image_url, timeout=10)
        if response.status_code == 200:
            # Create a temporary file for the image
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                tmp_file.write(response.content)
                tmp_file.flush()
                tmp_filename = tmp_file.name

            if RichImage:
                rich_img = RichImage.from_path(tmp_filename)
                console.print(Panel(rich_img, title="Game Wallpaper", border_style="magenta"))
            else:
                console.print("[yellow]Rich image rendering not available.[/yellow]")
            os.unlink(tmp_filename)
        else:
            console.print("[red]Failed to download wallpaper image.[/red]")
    except Exception as e:
        console.print(f"[red]Error displaying wallpaper: {e}[/red]")


# --------------------------------------------------------------------
# Main Program Flow

def main():
    console.rule("[bold green]Game Insight Toolkit (Giant Bomb + HLTB)[/bold green]", style="green")
    
    while True:
        # Prompt for game name
        game_query = Prompt.ask("\nEnter game name (or type 'exit' to quit)")
        if game_query.lower() in ["exit", "quit"]:
            console.print("\n[bold]Goodbye![/bold]")
            break

        # Step 1: Search Giant Bomb for game matches
        gb_results = search_giantbomb(game_query)
        if not gb_results:
            console.print("[red]No Giant Bomb results. Try another game.[/red]")
            continue

        # Step 2: Let user choose the correct Giant Bomb game if multiple are found
        chosen_gb = choose_gb_game(gb_results)
        if not chosen_gb:
            continue

        # Step 3: Get detailed data from Giant Bomb
        game_id = chosen_gb.get("id")
        gb_details = get_giantbomb_details(game_id)
        if not gb_details:
            console.print("[red]Could not retrieve detailed Giant Bomb info.[/red]")
            continue

        # Display Giant Bomb details; capture the wallpaper image URL if available
        wallpaper_url = display_gb_details(gb_details)
        
        # Step 4: Search for HowLongToBeat data for the game
        hltb_results = get_hltb_results(game_query)
        if not hltb_results:
            console.print("[yellow]No HowLongToBeat results found.[/yellow]")
        else:
            # Try to match the selected Giant Bomb game to an HLTB result using fuzzy string matching
            matched_hltb = match_hltb_result(gb_details.get("name", ""), hltb_results)
            if matched_hltb:
                display_hltb_details(matched_hltb)
            else:
                console.print("[yellow]Could not confidently match HowLongToBeat data. Showing available choices.[/yellow]")
                table = Table(title="HowLongToBeat Search Results", box=box.MINIMAL_DOUBLE_HEAD)
                table.add_column("Index", justify="center")
                table.add_column("Game Title", style="yellow")
                table.add_column("Main Story (hrs)", justify="right", style="green")
                for idx, result in enumerate(hltb_results[:5]):  # showing up to 5 results
                    table.add_row(str(idx + 1), result.game_name, str(result.main_story or "N/A"))
                console.print(table)
                choice = Prompt.ask("Choose HLTB result number (or type 'skip' to continue)", default="skip")
                if choice.lower() not in ["skip", "exit", "quit"]:
                    try:
                        idx = int(choice) - 1
                        if 0 <= idx < len(hltb_results):
                            display_hltb_details(hltb_results[idx])
                    except Exception:
                        console.print("[red]Invalid selection for HLTB data.[/red]")

        # Step 5: Display wallpaper image from Giant Bomb data if available
        display_wallpaper(wallpaper_url)

# --------------------------------------------------------------------
if __name__ == "__main__":
    main()
