from flask import Blueprint, request, jsonify, current_app
import requests
import os
from datetime import datetime

repo_routes = Blueprint('repo_routes', __name__)
GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

@repo_routes.route('/api/submit', methods=['POST'])
def submit_student_project():
    data = request.json
    required_fields = ['github_url', 'student_name', 'student_id', 'year', 'semester', 'module_name', 'module_code']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Add the created_at field with the current timestamp
    data['created_at'] = datetime.now()

    # Access the database from the app configuration
    db = current_app.config['DB']
    # Insert into MongoDB
    db.student_projects.insert_one(data)
    return jsonify({"message": "Data saved successfully"}), 201

@repo_routes.route('/api/projects', methods=['GET'])
def get_all_projects():
    # Access the database from the app configuration
    db = current_app.config['DB']
    
    # Fetch all documents from the collection
    projects = list(db.student_projects.find({}))
    
    # Convert ObjectId to string and prepare the response
    for project in projects:
        project['_id'] = str(project['_id'])
    
    return jsonify(projects), 200


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
