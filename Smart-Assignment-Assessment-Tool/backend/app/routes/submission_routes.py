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
    
@submission_bp.route("/update-video", methods=["POST"])
def update_video_id():
    try:
        db = current_app.db
        data = request.get_json()

        submission_id = data.get("submission_id")
        video_id = data.get("video_id")

        if not submission_id or not video_id:
            return jsonify({"error": "Missing required fields"}), 400

        submission_ref = db.collection("submissions").document(submission_id)
        submission_ref.update({"video_id": video_id})

        return jsonify({"message": "Video ID updated successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@submission_bp.route("/update-fields", methods=["PATCH"])
def update_submission_fields():
    try:
        db = current_app.db
        data = request.get_json()

        submission_id = data.pop("submission_id", None)
        if not submission_id:
            return jsonify({"error": "Missing submission_id"}), 400

        allowed_fields = {"code_id", "report_id", "video_id", "status"}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({"error": "No valid fields provided for update"}), 400

        submission_ref = db.collection("submissions").document(submission_id)
        submission_ref.update(update_data)

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
    
@submission_bp.route("/getSubmissionsBySubmission/<submission_id>", methods=["GET"])
def get_submissions_by_relevant_submission_id(submission_id):
    try:
        db = current_app.db
        submission_ref = db.collection("submissions").document(submission_id)
        submission_data = submission_ref.get()

        if not submission_data.exists:
            return jsonify({"error": "Submission not found"}), 404

        submission = submission_data.to_dict()
        code_id = submission.get("code_id")
        report_id = submission.get("report_id")
        video_id = submission.get("video_id")

        submission_data = {
            "code_id": code_id,
            "report_id": report_id,
            "video_id": video_id,
        }
        return jsonify({"submission_data": submission_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@submission_bp.route("/getSubmissionData/<submission_id>", methods=["GET"])
def get_viva_dashboard_data(submission_id):
    try:
        db = current_app.db
        submission_ref = db.collection("submissions").document(submission_id)
        submission_data = submission_ref.get()

        if not submission_data.exists:
            return jsonify({"error": "Submission not found"}), 404

        submission = submission_data.to_dict()
        student_id = submission.get("student_id")
        assignment_id = submission.get("assignment_id")
        created_at = submission.get("created_at")

        # Fetch assignment details (assuming a collection `assignments`)
        assignment_ref = db.collection("assignments").document(assignment_id)
        assignment_data = assignment_ref.get()

        if not assignment_data.exists:
            return jsonify({"error": "Assignment not found"}), 404

        assignment = assignment_data.to_dict()
        module_id = assignment.get("module_id")
        assignment_name = assignment.get("name")

        # Fetch module details 
        module_ref = db.collection("modules").document(module_id)
        module_data = module_ref.get()

        if not module_data.exists:
            return jsonify({"error": "Module not found"}), 404
        
        module = module_data.to_dict()
        module_name = module.get("name")
        module_semester = module.get("semester")
        module_year = module.get("year")

        # Fetch student email
        user_ref = db.collection("users").document(student_id)
        user_data = user_ref.get()

        if not user_data.exists:
            return jsonify({"error": "Student not found"}), 404

        student_email = user_data.to_dict().get("email")

        submission_data = {
            "assignment_id": assignment_id,
            "submission_id": submission_id,
            "module_name": module_name,
            "module_semester": module_semester,
            "module_year": module_year,
            "assignment_name": assignment_name,
            "student_email": student_email,
            "submitted_date": created_at
        }

        # Log viva dashboard data for debugging
        print("Viva Dashboard Data:", submission_data)

        return jsonify({"submission_data": submission_data}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500



# update report id 
@submission_bp.route("/update-report", methods=["POST"])
def update_report_id():
    try:
        db = current_app.db
        data = request.get_json()

        submission_id = data.get("submission_id")
        report_id = data.get("report_id")

        if not submission_id or not report_id:
            return jsonify({"error": "Missing required fields"}), 400

        # Retrieve the submission and update report_id
        submission_ref = db.collection("submissions").document(submission_id)
        submission_ref.update({"report_id": report_id})

        return jsonify({"message": "Report ID updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# submission exists for a given assignment_id and student_id
@submission_bp.route("/check-submission", methods=["POST"])
def check_submission():
    try:
        db = current_app.db
        data = request.get_json()

        assignment_id = data.get("assignment_id")
        student_id = data.get("student_id")

        if not assignment_id or not student_id:
            return jsonify({"error": "Missing required fields"}), 400

        # Query Firestore for a matching submission
        submissions_ref = db.collection("submissions")
        query = submissions_ref.where("assignment_id", "==", assignment_id).where("student_id", "==", student_id).limit(1)
        results = query.stream()

        for submission in results:
            return jsonify({"exists": True, "submission_id": submission.id}), 200

        return jsonify({"exists": False}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
