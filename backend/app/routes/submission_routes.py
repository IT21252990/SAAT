from flask import Blueprint, request, jsonify, current_app
from uuid import uuid4

submission_bp = Blueprint("submission", __name__)

@submission_bp.route("/create", methods=["POST"])
def create_submission():
    try:
        db = current_app.db  # Use Firestore client from app context
        data = request.get_json()
        assignment_id = data.get("assignment_id")
        submission_type = data.get("submission_type")
        student_id = data.get("student_id")

        if not assignment_id or not submission_type or not student_id:
            return jsonify({"error": "Missing required fields"}), 400

        submission_id = str(uuid4())  # Generate a unique ID
        submission_ref = db.collection("submissions").document(submission_id)

        submission_data = {
            "submission_id": submission_id,
            "assignment_id": assignment_id,
            "submission_type": submission_type,
            "student_id": student_id,
            "status": "Pending",
            "code_id": None,
            "report_id": None,
            "video_id": None,
            "created_at": current_app.firestore.SERVER_TIMESTAMP,
        }

        submission_ref.set(submission_data)
        return jsonify({"message": "Submission created successfully!", "submission": submission_data}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@submission_bp.route("/update/<submission_id>", methods=["PUT"])
def update_submission(submission_id):
    try:
        db = current_app.db
        submission_ref = db.collection("submissions").document(submission_id)
        submission = submission_ref.get()

        if not submission.exists:
            return jsonify({"error": "Submission not found"}), 404

        data = request.get_json()
        submission_type = data.get("submission_type")
        file_id = data.get("file_id")

        if not submission_type or not file_id:
            return jsonify({"error": "Missing submission type or file ID"}), 400

        update_data = {}
        if submission_type == "Code":
            update_data["code_id"] = file_id
        elif submission_type == "Report":
            update_data["report_id"] = file_id
        elif submission_type == "Video":
            update_data["video_id"] = file_id
        else:
            return jsonify({"error": "Invalid submission type"}), 400

        submission_ref.update(update_data)
        return jsonify({"message": "Submission updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
