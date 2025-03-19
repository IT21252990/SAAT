from flask import Blueprint, request, jsonify, current_app
from app.utils.repo_analysis import check_file_naming_conventions, check_code_naming_conventions, check_code_comments_accuracy
from app.models.code_model import Code

# Define Routes
check_naming_bp = Blueprint('check_naming_routes', __name__)

@check_naming_bp.route('/check-coding-comments', methods=['POST'])
def check_naming():
    data = request.get_json()
    repo_url = data.get("repo_url")
    
    if not repo_url:
        return jsonify({"error": "Repository URL is required"}), 400
        
    result = check_code_comments_accuracy(repo_url)
    return jsonify(result)

@check_naming_bp.route('/check-file-naming-conventions', methods=['POST'])
def checking_file_naming_conventions():
    """
    Check file naming conventions for a repository and store results in the database
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        repo_url = data.get("repo_url")
        
        if not code_id or not repo_url:
            return jsonify({"error": "Missing required fields: code_id or repo_url"}), 400
        
        # Check if the code_id exists
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        # Get naming convention results
        naming_results = check_file_naming_conventions(repo_url)
        
        # Check if there was an error with the API call
        if "error" in naming_results:
            return jsonify(naming_results), 500
        
        # Update the database with the results
        Code.update_file_naming_convention_results(db, code_id, naming_results)
        
        return jsonify({
            "message": "File naming convention check completed successfully",
            "results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@check_naming_bp.route('/file-naming-convention-results', methods=['GET'])
def get_file_naming_convention_results():
    """
    Get naming convention results for a specific code submission
    """
    code_id = request.args.get('code_id')
    
    if not code_id:
        return jsonify({"error": "Missing required parameter: code_id"}), 400
    
    try:
        db = current_app.db
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        code_data = doc.to_dict()
        naming_results = code_data.get("file_naming_convention_results", {})
        
        return jsonify({
            "code_id": code_id,
            "file_naming_convention_results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@check_naming_bp.route('/check-code-naming-conventions', methods=['POST'])
def checking_code_naming_conventions():
    """
    Check code naming conventions for a repository and store results in the database
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        repo_url = data.get("repo_url")
        
        if not code_id or not repo_url:
            return jsonify({"error": "Missing required fields: code_id or repo_url"}), 400
        
        # Check if the code_id exists
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        # Get naming convention results
        naming_results = check_code_naming_conventions(repo_url)
        
        # Check if there was an error with the API call
        if "error" in naming_results:
            return jsonify(naming_results), 500
        
        # Update the database with the results
        Code.update_code_naming_convention_results(db, code_id, naming_results)
        
        return jsonify({
            "message": "Code naming convention check completed successfully",
            "results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@check_naming_bp.route('/code-naming-convention-results', methods=['GET'])
def get_code_naming_convention_results():
    """
    Get naming convention results for a specific code submission
    """
    code_id = request.args.get('code_id')
    
    if not code_id:
        return jsonify({"error": "Missing required parameter: code_id"}), 400
    
    try:
        db = current_app.db
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        code_data = doc.to_dict()
        naming_results = code_data.get("code_naming_convention_results", {})
        
        return jsonify({
            "code_id": code_id,
            "code_naming_convention_results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@check_naming_bp.route('/check-code_comments_accuracy', methods=['POST'])
def checking_code_comments_accuracy():
    """
    Check code comments accuracy for a repository and store results in the database
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        repo_url = data.get("repo_url")
        
        if not code_id or not repo_url:
            return jsonify({"error": "Missing required fields: code_id or repo_url"}), 400
        
        # Check if the code_id exists
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        # Get naming convention results
        naming_results = check_code_comments_accuracy(repo_url)
        
        # Check if there was an error with the API call
        if "error" in naming_results:
            return jsonify(naming_results), 500
        
        # Update the database with the results
        Code.update_code_comments_accuracy(db, code_id, naming_results)
        
        return jsonify({
            "message": "Code Comments Accuracy check completed successfully",
            "results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@check_naming_bp.route('/code-comments-accuracy-results', methods=['GET'])
def get_code_comments_accuracy_results():
    """
    Get Comment Accuracy results for a specific code submission
    """
    code_id = request.args.get('code_id')
    
    if not code_id:
        return jsonify({"error": "Missing required parameter: code_id"}), 400
    
    try:
        db = current_app.db
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
        
        code_data = doc.to_dict()
        naming_results = code_data.get("code_comments_accuracy", {})
        
        return jsonify({
            "code_id": code_id,
            "code_naming_convention_results": naming_results
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    