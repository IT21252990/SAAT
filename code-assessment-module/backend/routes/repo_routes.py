from flask import Blueprint, request, jsonify, current_app
import requests
import os
import re
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


@repo_routes.route('/api/save-line-comment', methods=['POST'])
def save_line_comment():
    data = request.json
    # Required fields for saving a comment
    required_fields = ['repo_url', 'file_name', 'line_number', 'comment_text']

    # Validate required fields
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Add timestamp to the comment
    comment_data = {
        "repo_url": data['repo_url'],
        "file_name": data['file_name'],
        "line_number": data['line_number'],
        "comment_text": data['comment_text'],
        "created_at": datetime.now()
    }

    # Access the database from the app configuration
    db = current_app.config['DB']

    try:
        # Insert the comment into MongoDB
        db.comments.insert_one(comment_data)
        return jsonify({"message": "Comment saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Failed to save comment: {str(e)}"}), 500


# -----------------------

@repo_routes.route('/api/repo/contributors', methods=['GET'])
def get_repo_contributors():
    repo_url = request.args.get('repo_url')
    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')  # Remove .git if present
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contributors"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({"error": "Failed to fetch contributors"}), response.status_code


@repo_routes.route('/api/repo/commits', methods=['GET'])
def get_contributor_commits():
    repo_url = request.args.get('repo_url')
    contributor_login = request.args.get('contributor_login')
    page = request.args.get('page', 1, type=int)

    if not repo_url or not contributor_login:
        return jsonify({"error": "Missing required parameters: repo_url or contributor_login"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner = parts[-2]
        repo = parts[-1].replace('.git', '')  # Remove .git if present
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    params = {"author": contributor_login, "page": page, "per_page": 10}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        commits = response.json()
        total_commits = response.headers.get("X-Total-Count", len(commits))  # Fallback to current page count if absent

        links = {}
        if "Link" in response.headers:
            link_header = response.headers["Link"]
            for link in link_header.split(","):
                match = re.search(r'<(.+)>; rel="(\w+)"', link)
                if match:
                    links[match.group(2)] = match.group(1)

        return jsonify({
            "commits": commits,
            "total_commits": total_commits,
            "pagination": links
        }), 200
    else:
        return jsonify({"error": "Failed to fetch commits", "status_code": response.status_code}), response.status_code