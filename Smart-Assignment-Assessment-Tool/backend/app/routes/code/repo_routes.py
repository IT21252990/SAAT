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


# @repo_bp.route('/commits', methods=['GET'])
# def get_contributor_commits():
#     """ Fetch contributor commits from GitHub """
#     repo_url = request.args.get('repo_url')
#     contributor_login = request.args.get('contributor_login')
#     page = request.args.get('page', 1, type=int)

#     if not repo_url or not contributor_login:
#         return jsonify({"error": "Missing required parameters"}), 400

#     try:
#         parts = repo_url.rstrip('/').split('/')
#         owner, repo = parts[-2], parts[-1].replace('.git', '')
#     except IndexError:
#         return jsonify({"error": "Invalid GitHub repository URL"}), 400

#     url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
#     headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
#     params = {"author": contributor_login, "page": page, "per_page": 10}
#     response = requests.get(url, headers=headers, params=params)

#     return jsonify(response.json()), response.status_code if response.ok else 400

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

    if not response.ok:
        return jsonify({"error": f"GitHub API error: {response.status_code}"}), response.status_code
        
    # Get Link header for pagination information
    link_header = response.headers.get('Link', '')
    pagination = {}
    
    # Parse Link header to extract prev and next URLs
    if link_header:
        links = {}
        for link in link_header.split(','):
            part = link.split(';')
            url = part[0].strip()[1:-1]  # Remove < and >
            rel = part[1].split('=')[1].strip('"')  # Extract rel value
            links[rel] = url
            
        if 'next' in links:
            pagination['next'] = links['next']
        if 'prev' in links:
            pagination['prev'] = links['prev']
            
    # Format the response to match what the frontend expects
    commits_data = response.json()
    
    # If we got an error message instead of an array
    if not isinstance(commits_data, list):
        return jsonify({"error": "Invalid response from GitHub API"}), 400
    
    # Count total commits for this contributor
    # Note: This is approximate - GitHub API doesn't provide the total count directly
    total_commits = len(commits_data)
    if page == 1 and not pagination.get('next'):
        # If there's only one page, this is the total
        pass
    else:
        # Otherwise, we need to make another API call to count all commits
        total_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
        total_params = {"author": contributor_login, "per_page": 1}  # Just to get the count
        total_response = requests.get(total_url, headers=headers, params=total_params)
        
        if total_response.ok and 'link' in total_response.headers:
            link = total_response.headers['link']
            if 'rel="last"' in link:
                # Extract page number from last link
                last_link = [l.split(';')[0] for l in link.split(',') if 'rel="last"' in l][0]
                last_page = int(last_link.split('page=')[1].split('&')[0])
                total_commits = (last_page - 1) * 10 + len(total_response.json())
    
    # Return the data in a structured format as expected by frontend
    result = {
        "commits": commits_data,
        "total_commits": total_commits,
        "pagination": pagination
    }
    
    return jsonify(result), 200

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


@repo_bp.route('/contributor-activity', methods=['GET'])
def get_contributor_activity():
    """Fetch all contributor activity data from GitHub"""
    repo_url = request.args.get('repo_url')
    contributor_login = request.args.get('contributor_login')

    if not repo_url or not contributor_login:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        parts = repo_url.rstrip('/').split('/')
        owner, repo = parts[-2], parts[-1].replace('.git', '')
    except IndexError:
        return jsonify({"error": "Invalid GitHub repository URL"}), 400

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/stats/contributors"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}

    response = requests.get(url, headers=headers)

    if response.status_code == 202:
        return jsonify({"message": "GitHub is calculating statistics. Please try again later."}), 202

    if not response.ok:
        return jsonify({"error": f"GitHub API error: {response.status_code}"}), response.status_code

    contributors_data = response.json()

    contributor_data = None
    for contrib in contributors_data:
        if contrib.get('author', {}).get('login') == contributor_login:
            contributor_data = contrib
            break

    if not contributor_data:
        return jsonify({"error": f"No activity data found for {contributor_login}"}), 404

    weeks_data = contributor_data.get('weeks', [])
    weeks_data.sort(key=lambda x: x.get('w', 0))

    activity_data = []
    for i, week in enumerate(weeks_data):
        week_timestamp = week.get('w', 0)
        week_date = datetime.fromtimestamp(week_timestamp).strftime('%Y-%m-%d')
        activity_data.append({
            'week': f"Week {i+1}",
            'commits': week.get('c', 0),
            'additions': week.get('a', 0),
            'deletions': week.get('d', 0),
            'date': week_date
        })

    print(f"activity_data: {activity_data}")

    return jsonify({
        "activity_data": activity_data,
        "total_commits": contributor_data.get('total', 0),
        "total_additions": sum(week.get('a', 0) for week in weeks_data),
        "total_deletions": sum(week.get('d', 0) for week in weeks_data)
    }), 200