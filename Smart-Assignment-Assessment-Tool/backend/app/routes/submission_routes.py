from flask import Blueprint, request, jsonify, current_app
from uuid import uuid4

from app.models.submission_model import Submission

submission_bp = Blueprint("submission", __name__)

# create_submission
# @submission_bp.route("/create", methods=["POST"])
# def create_submission():
#     try:
#         db = current_app.db  # Use Firestore client from app context
#         data = request.get_json()
#         assignment_id = data.get("assignment_id")
#         student_id = data.get("student_id")

#         if not assignment_id or not student_id:
#             return jsonify({"error": "Missing required fields"}), 400

#         submission_id = str(uuid4())  # Generate a unique ID
#         submission_ref = db.collection("submissions").document(submission_id)

#         submission_data = {
#             "submission_id": submission_id,
#             "assignment_id": assignment_id,
#             "student_id": student_id,
#             "status": "Pending",
#             "code_id": None,
#             "report_id": None,
#             "video_id": None,
#             "created_at": current_app.firestore.SERVER_TIMESTAMP,
#         }

#         submission_ref.set(submission_data)
#         return jsonify({"message": "Submission created successfully!", "submission": submission_data}), 201

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@submission_bp.route("/create", methods=["POST"])
def create_submission():
    try:
        db = current_app.db  # Use Firestore client from app context
        data = request.get_json()
        assignment_id = data.get("assignment_id")
        student_id = data.get("student_id")
        status = "Pending"
        code_id = data.get("code_id")
        report_id = data.get("report_id")
        video_id = data.get("video_id")

        # if not assignment_id or not submission_type or not student_id:
        #     return jsonify({"error": "Missing required fields"}), 400

        if not assignment_id:
            return jsonify({"error": "Missing assignment_id"}), 400
        elif not student_id:
            return jsonify({"error": "Missing student_id"}), 400


        submission_id = str(uuid4())  # Generate a unique ID

        new__submission = Submission(submission_id, student_id, status, assignment_id, code_id, report_id, video_id)
        new__submission.save(db)

        return jsonify({"message": "Submission created successfully!", "submission_id": submission_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# update submission
@submission_bp.route("/update", methods=["POST"])
def update_submission():
    try:
        db = current_app.db
        data = request.get_json()
        
        submission_id = data.get("submission_id")
        code_id = data.get("code_id")
        
        if not submission_id or not code_id:
            return jsonify({"error": "Missing required fields"}), 400

        # Retrieve the submission and update it
        submission_ref = db.collection("submissions").document(submission_id)
        submission_ref.update({"code_id": code_id})

        return jsonify({"message": "Submission updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# get all submissions by assignment id
@submission_bp.route("/getSubmissionsByAssignment/<assignment_id>", methods=["GET"])
def get_submissions_by_assignment(assignment_id):
    try:
        db = current_app.db
        submissions_ref = db.collection("submissions").where("assignment_id", "==", assignment_id)
        submissions = submissions_ref.stream()

        submissions_list = [submission.to_dict() for submission in submissions]

        return jsonify({"submissions": submissions_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
