from flask import Blueprint, request, jsonify, current_app
import requests
import os
from dotenv import load_dotenv
import re
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

load_dotenv()  # Load environment variables from .env

# Get Firebase credentials path from environment
firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS")

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_credentials_path)
    firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# Define Routes
repo_routes = Blueprint('repo_routes', __name__)
GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


@repo_routes.route('/api/submit', methods=['POST'])
def submit_student_project():
    """ Save student project details to Firestore """
    data = request.json
    required_fields = ['github_url', 'student_name', 'student_id', 'year', 'semester', 'module_name', 'module_code']
    
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    data['created_at'] = datetime.utcnow().isoformat()  # Store timestamps as ISO format
    
    try:
        db.collection("student_projects").add(data)
        return jsonify({"message": "Data saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@repo_routes.route('/api/projects', methods=['GET'])
def get_all_projects():
    """ Fetch all student projects from Firestore """
    try:
        projects_ref = db.collection("student_projects").stream()
        projects = [{**doc.to_dict(), "id": doc.id} for doc in projects_ref]
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@repo_routes.route('/api/repo', methods=['GET'])
def get_repo_details():
    """ Fetch GitHub repository details """
    repo_url = request.args.get('repo_url')
    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    return jsonify(response.json()), response.status_code if response.ok else 400


@repo_routes.route('/api/repo/contents', methods=['GET'])
def get_repo_contents():
    """ Fetch repository file structure from GitHub """
    repo_url = request.args.get('repo_url')
    path = request.args.get('path', '')

    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    return jsonify(response.json()), response.status_code if response.ok else 400


@repo_routes.route('/api/file-content', methods=['GET'])
def get_file_content():
    """ Fetch file content from GitHub """
    repo_url = request.args.get('repo_url')
    path = request.args.get('path')

    if not repo_url or not path:
        return jsonify({"error": "Missing required parameters: repo_url or path"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    return jsonify(response.json()), response.status_code if response.ok else 400


@repo_routes.route('/api/save-line-comment', methods=['POST'])
def save_line_comment():
    """ Save line comments to Firestore """
    data = request.json
    required_fields = ['repo_url', 'file_name', 'line_number', 'comment_text']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    comment_data = {
        "repo_url": data['repo_url'],
        "file_name": data['file_name'],
        "line_number": data['line_number'],
        "comment_text": data['comment_text'],
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        db.collection("comments").add(comment_data)
        return jsonify({"message": "Comment saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@repo_routes.route('/api/repo/contributors', methods=['GET'])
def get_repo_contributors():
    """ Fetch contributors from GitHub """
    repo_url = request.args.get('repo_url')
    if not repo_url:
        return jsonify({"error": "Missing required parameter: repo_url"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contributors"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    response = requests.get(url, headers=headers)

    return jsonify(response.json()), response.status_code if response.ok else 400


@repo_routes.route('/api/repo/commits', methods=['GET'])
def get_contributor_commits():
    """ Fetch contributor commits from GitHub """
    repo_url = request.args.get('repo_url')
    contributor_login = request.args.get('contributor_login')
    page = request.args.get('page', 1, type=int)

    if not repo_url or not contributor_login:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
    params = {"author": contributor_login, "page": page, "per_page": 10}
    response = requests.get(url, headers=headers, params=params)

    return jsonify(response.json()), response.status_code if response.ok else 400
