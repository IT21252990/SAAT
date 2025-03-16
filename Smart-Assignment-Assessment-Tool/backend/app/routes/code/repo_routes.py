from flask import Blueprint, request, jsonify, current_app
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from app.models.code_model import Code

load_dotenv()  # Load environment variables from .env

# Define Routes
repo_bp = Blueprint('repo_routes', __name__)

GITHUB_API_BASE = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Create code submission
@repo_bp.route("/add-repo-submission", methods=["POST"])
def add_repo_submission():
    try:
        db = current_app.db
        data = request.get_json()
        
        submission_id = data.get("submission_id")
        github_url = data.get("github_url")
        comments = data.get("comments")
        final_feedback = data.get("final_feedback")
        
        if not submission_id or not github_url:
            return jsonify({"error": "Missing required fields"}), 400
        
        code_id = str(uuid.uuid4())  # Generate a unique code ID

        # Create an Code instance and save it
        new_code_submission = Code(code_id, submission_id, github_url, comments, final_feedback)
        new_code_submission.save(db)

        return jsonify({"message": "Code Submission created successfully!", "code_id": code_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@repo_bp.route('/repo-details', methods=['GET'])
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


@repo_bp.route('/repo-contents', methods=['GET'])
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


@repo_bp.route('/file-content', methods=['GET'])
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


@repo_bp.route('/save-line-comment', methods=['POST'])
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


@repo_bp.route('/contributors', methods=['GET'])
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


@repo_bp.route('/commits', methods=['GET'])
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


@repo_bp.route('/get-github-url', methods=['GET'])
def get_github_url():
    """ Fetch GitHub URL by code_id """
    code_id = request.args.get('code_id')

    if not code_id:
        return jsonify({"error": "Missing required parameter: code_id"}), 400

    try:
        db = current_app.db
        github_url = Code.get_github_url(db, code_id)

        if github_url:
            return jsonify({"github_url": github_url}), 200
        else:
            return jsonify({"error": "No record found for the given code_id"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
