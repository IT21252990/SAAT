from flask import Blueprint, request, jsonify, current_app
import uuid
from app.utils.generate_questions import generate_questions_gemini  # Import utility

qgenerate_bp = Blueprint("qgenerate", __name__)

@qgenerate_bp.route("/generateGeneralQuestions", methods=["POST"])
def generate_general_questions():
    try:
        db = current_app.db  # Access Firestore database from the Flask app context
        data = request.get_json()
        submission_id = data.get("submission_id")
        metric_types = data.get("metric_types", [])

        if not submission_id or not metric_types:
            return jsonify({"error": "Missing required fields"}), 400

        # Fetch the assignment_id from the submissions collection
        submission_doc = db.collection("submissions").document(submission_id).get()
        if not submission_doc.exists:
            return jsonify({"error": "Submission not found"}), 404
        
        submission_data = submission_doc.to_dict()
        assignment_id = submission_data.get("assignment_id")
        
        if not assignment_id:
            return jsonify({"error": "Assignment ID not found in submission"}), 404

        # Fetch the assignment description from the assignments collection
        assignment_doc = db.collection("assignments").document(assignment_id).get()
        if not assignment_doc.exists:
            return jsonify({"error": "Assignment not found"}), 404
        
        assignment_data = assignment_doc.to_dict()
        assignment_description = assignment_data.get("description")

        if not assignment_description:
            return jsonify({"error": "Assignment description not found"}), 404

        question_data = {
            "id": str(uuid.uuid4()),  # Temporary UUID for identification
            "submission_id": submission_id,
            "category": "general",
            "questions": []
        }

        for metric in metric_types:
            generated_text = generate_questions_gemini(assignment_description, metric)

            if not generated_text:
                return jsonify({"error": f"Failed to generate questions for {metric}"}), 500

            questions = {"easy": None, "moderate": None, "difficult": None}

            for line in generated_text.strip().split("\n"):
                if "Easy Question" in line:
                    questions["easy"] = {"question": line.split(": ", 1)[-1]}
                elif "Moderate Question" in line:
                    questions["moderate"] = {"question": line.split(": ", 1)[-1]}
                elif "Difficult Question" in line:
                    questions["difficult"] = {"question": line.split(": ", 1)[-1]}
                elif "Answer" in line:
                    if questions["easy"] and "answer" not in questions["easy"]:
                        questions["easy"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["moderate"] and "answer" not in questions["moderate"]:
                        questions["moderate"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["difficult"] and "answer" not in questions["difficult"]:
                        questions["difficult"]["answer"] = line.split(": ", 1)[-1]

            question_data["questions"].append({
                "metric_type": metric,
                "qna": questions
            })

        return jsonify({"message": "General uestions generated successfully", "data": question_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@qgenerate_bp.route("/generateCodeQuestions", methods=["POST"])
def generate_code_questions():
    try:
        db = current_app.db  # Access Firestore database from the Flask app context
        data = request.get_json()
        submission_id = data.get("submission_id")
        metric_types = data.get("metric_types", [])

        if not submission_id or not metric_types:
            return jsonify({"error": "Missing required fields"}), 400

        # Fetch the code from the submissions collection
        submission_doc = db.collection("submissions").document(submission_id).get()
        if not submission_doc.exists:
            return jsonify({"error": "Submission not found"}), 404
        
        submission_data = submission_doc.to_dict()
        code_id = submission_data.get("code_id")
        
        if not code_id:
            return jsonify({"error": "code ID not found in submission"}), 404

        # Fetch the code url from the code collection
        code_doc = db.collection("codes").document(code_id).get()
        if not code_doc.exists:
            return jsonify({"error": "code not found"}), 404
        
        code_data = code_doc.to_dict()
        github_url = code_data.get("github_url")

        if not github_url:
            return jsonify({"error": "github_url not found"}), 404

        question_data = {
            "id": str(uuid.uuid4()),  # Temporary UUID for identification
            "submission_id": submission_id,
            "category": "code",
            "questions": []
        }

        for metric in metric_types:
            generated_text = generate_questions_gemini(github_url, metric)

            if not generated_text:
                return jsonify({"error": f"Failed to generate questions for {metric}"}), 500

            questions = {"easy": None, "moderate": None, "difficult": None}

            for line in generated_text.strip().split("\n"):
                if "Easy Question" in line:
                    questions["easy"] = {"question": line.split(": ", 1)[-1]}
                elif "Moderate Question" in line:
                    questions["moderate"] = {"question": line.split(": ", 1)[-1]}
                elif "Difficult Question" in line:
                    questions["difficult"] = {"question": line.split(": ", 1)[-1]}
                elif "Answer" in line:
                    if questions["easy"] and "answer" not in questions["easy"]:
                        questions["easy"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["moderate"] and "answer" not in questions["moderate"]:
                        questions["moderate"]["answer"] = line.split(": ", 1)[-1]
                    elif questions["difficult"] and "answer" not in questions["difficult"]:
                        questions["difficult"]["answer"] = line.split(": ", 1)[-1]

            question_data["questions"].append({
                "metric_type": metric,
                "qna": questions
            })

        return jsonify({"message": "Code questions generated successfully", "data": question_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
