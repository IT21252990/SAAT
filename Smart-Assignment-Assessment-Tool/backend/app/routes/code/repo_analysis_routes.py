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
    
@check_naming_bp.route('/update-file-naming-result', methods=['POST'])
def update_file_naming_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        file_name = data.get("file_name")
        path = data.get("path")
        reason = data.get("reason")
        
        if not code_id or not file_name:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        naming_results = code_data.get("file_naming_convention_results", {})
        
        # Update the specific file entry
        if "invalid_files" in naming_results:
            for i, file in enumerate(naming_results["invalid_files"]):
                if file["file_name"] == file_name:
                    naming_results["invalid_files"][i] = {
                        "file_name": file_name,
                        "path": path or file.get("path", ""),
                        "reason": reason or file.get("reason", "")
                    }
                    break
        
        doc_ref.update({"file_naming_convention_results": naming_results})
        
        return jsonify({"message": "File naming result updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@check_naming_bp.route('/delete-file-naming-result', methods=['POST'])
def delete_file_naming_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        file_name = data.get("file_name")
        
        if not code_id or not file_name:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        naming_results = code_data.get("file_naming_convention_results", {})
        
        # Remove the specific file entry
        if "invalid_files" in naming_results:
            naming_results["invalid_files"] = [
                file for file in naming_results["invalid_files"] 
                if file["file_name"] != file_name
            ]
            
            # Update status if no more invalid files
            if not naming_results["invalid_files"]:
                naming_results["status"] = "Yes"
        
        doc_ref.update({"file_naming_convention_results": naming_results})
        
        return jsonify({"message": "File naming result deleted successfully"}), 200
        
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
    
@check_naming_bp.route('/update-code-naming-result', methods=['POST'])
def update_code_naming_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        element_name = data.get("element_name")
        element_type = data.get("element_type")
        file_path = data.get("file_path")
        line_number = data.get("line_number")
        reason = data.get("reason")
        suggested_name = data.get("suggested_name")
        
        if not code_id or not element_name:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        naming_results = code_data.get("code_naming_convention_results", {})
        
        # Update the specific code naming issue
        if "issues" in naming_results:
            for i, issue in enumerate(naming_results["issues"]):
                if issue["element_name"] == element_name:
                    naming_results["issues"][i] = {
                        "element_name": element_name,
                        "element_type": element_type or issue.get("element_type", ""),
                        "file_path": file_path or issue.get("file_path", ""),
                        "line_number": line_number or issue.get("line_number", ""),
                        "reason": reason or issue.get("reason", ""),
                        "suggested_name": suggested_name or issue.get("suggested_name", "")
                    }
                    break
        
        doc_ref.update({"code_naming_convention_results": naming_results})
        
        return jsonify({"message": "Code naming result updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@check_naming_bp.route('/delete-code-naming-result', methods=['POST'])
def delete_code_naming_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        element_name = data.get("element_name")
        
        if not code_id or not element_name:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        naming_results = code_data.get("code_naming_convention_results", {})
        
        # Remove the specific code naming issue
        if "issues" in naming_results:
            naming_results["issues"] = [
                issue for issue in naming_results["issues"] 
                if issue["element_name"] != element_name
            ]
            
            # Update status if no more issues
            if not naming_results["issues"]:
                naming_results["status"] = "Yes"
        
        doc_ref.update({"code_naming_convention_results": naming_results})
        
        return jsonify({"message": "Code naming result deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@check_naming_bp.route('/check-code-comments-accuracy', methods=['POST'])
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
    
@check_naming_bp.route('/update-comments-accuracy-result', methods=['POST'])
def update_comments_accuracy_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        file_path = data.get("file_path")
        line_number = data.get("line_number")
        comment_type = data.get("comment_type")
        actual_comment = data.get("actual_comment")
        issue = data.get("issue")
        suggestion = data.get("suggestion")
        
        if not code_id or not file_path or not line_number:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        comments_results = code_data.get("code_comments_accuracy", {})
        
        # Update the specific comment accuracy issue
        if "issues" in comments_results:
            for i, issue_data in enumerate(comments_results["issues"]):
                if (issue_data["file_path"] == file_path and 
                    str(issue_data["line_number"]) == str(line_number)):
                    comments_results["issues"][i] = {
                        "file_path": file_path,
                        "line_number": line_number,
                        "comment_type": comment_type or issue_data.get("comment_type", ""),
                        "actual_comment": actual_comment or issue_data.get("actual_comment", ""),
                        "issue": issue or issue_data.get("issue", ""),
                        "suggestion": suggestion or issue_data.get("suggestion", "")
                    }
                    break
        
        doc_ref.update({"code_comments_accuracy": comments_results})
        
        return jsonify({"message": "Comments accuracy result updated successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@check_naming_bp.route('/delete-comments-accuracy-result', methods=['POST'])
def delete_comments_accuracy_result():
    try:
        db = current_app.db
        data = request.get_json()
        
        code_id = data.get("code_id")
        file_path = data.get("file_path")
        line_number = data.get("line_number")
        
        if not code_id or not file_path or not line_number:
            return jsonify({"error": "Missing required fields"}), 400
            
        doc_ref = db.collection("codes").document(code_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Code ID not found"}), 404
            
        code_data = doc.to_dict()
        comments_results = code_data.get("code_comments_accuracy", {})
        
        # Remove the specific comment accuracy issue
        if "issues" in comments_results:
            comments_results["issues"] = [
                issue for issue in comments_results["issues"] 
                if not (issue["file_path"] == file_path and 
                       str(issue["line_number"]) == str(line_number))
            ]
            
            # Update status if no more issues
            if not comments_results["issues"]:
                comments_results["status"] = "Pass"
        
        doc_ref.update({"code_comments_accuracy": comments_results})
        
        return jsonify({"message": "Comments accuracy result deleted successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500  