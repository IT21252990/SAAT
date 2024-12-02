import requests
import os

GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def fetch_from_github(endpoint):
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(f"{GITHUB_API_BASE}{endpoint}", headers=headers)
    return response.json()
