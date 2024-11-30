from flask import Blueprint, request, jsonify
import requests
import os

repo_routes = Blueprint('repo_routes', __name__)
GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

@repo_routes.route('/api/repo', methods=['GET'])
def get_repo_details():
    repo_url = request.args.get('repo_url')
    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    # Extract owner and repo from the GitHub URL
    try:
        parts = repo_url.rstrip('/').split('/')
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')  # Remove .git if present
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    # Fetch repository details from GitHub
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({"error": "Failed to fetch repository details"}), response.status_code

   
@repo_routes.route('/api/repo/contents', methods=['GET'])
def get_repo_contents():
    repo_url = request.args.get('repo_url')
    path = request.args.get('path', '')  # Optional path

    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')  # Remove .git if present
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({"error": "Failed to fetch repository contents"}), response.status_code


@repo_routes.route('/api/file-content', methods=['GET'])
def get_file_content():
    repo_url = request.args.get('repo_url')
    path = request.args.get('path')

    if not repo_url or not path:
        return jsonify({"error": "Missing required parameters: repo_url or path"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')  # Remove .git if present
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({"error": "Failed to fetch file content", "status_code": response.status_code}), response.status_code
