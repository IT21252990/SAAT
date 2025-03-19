from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

marking_scheme_bp = Blueprint("markingScheme", __name__)
report_submission_bp = Blueprint("ReportSubmissions", __name__)

# Create Marking Scheme
@marking_scheme_bp.route("/create-marking-scheme", methods=["POST"])
def create_marking_scheme():
    try:
        db = current_app.db
        data = request.get_json()

        rubric_name = data.get("rubricName")
        criteria = data.get("criteria")
        module_code = data.get("moduleCode")
        assignment_id = data.get("assignment_id")
        # tutor = request.user["_id"] if request.user else None  # Assuming user info is stored in request

        if not rubric_name or not criteria or not module_code :
            return jsonify({"error": "Missing required fields"}), 400

        # Create new marking scheme document
        marking_scheme_ref = db.collection("marking_schemes").document()
        marking_scheme_ref.set({
            "title": rubric_name,
            "module_code": module_code,
            "status": "Active",
            "assignment_id": assignment_id,
            "criteria": [
                {
                    "criterion": criterion["name"],
                    "low_description": criterion["lowDescription"],
                    "high_description": criterion["highDescription"],
                    "weightage": criterion["weight"]
                } for criterion in criteria
            ],
            # "tutor": tutor,
            "marking_scheme_file_url": ""  # Provide URL if necessary
        })

        return jsonify({"message": "Marking scheme created successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get All Marking Schemes
@marking_scheme_bp.route("/markingSchemes", methods=["GET"])
def get_all_marking_schemes():
    try:
        db = current_app.db
        marking_schemes_ref = db.collection("marking_schemes")
        marking_schemes = marking_schemes_ref.stream()

        marking_scheme_list = []
        for scheme in marking_schemes:
            marking_scheme_data = scheme.to_dict()
            marking_scheme_data["id"] = scheme.id  # Include ID in response
            marking_scheme_list.append(marking_scheme_data)

        return jsonify({"marking_schemes": marking_scheme_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Get Marking Scheme by Assignment ID
@marking_scheme_bp.route("/markingScheme/<assignment_id>", methods=["GET"])
def get_marking_scheme_by_assignment_id(assignment_id):
    try:
        db = current_app.db
        marking_schemes_ref = db.collection("marking_schemes")
        
        # Query to find the marking scheme with the given assignment_id
        query = marking_schemes_ref.where("assignment_id", "==", assignment_id).stream()
        
        marking_schemes = []
        for scheme in query:
            marking_scheme_data = scheme.to_dict()
            marking_scheme_data["id"] = scheme.id  # Include Firestore document ID
            marking_schemes.append(marking_scheme_data)

        if not marking_schemes:
            return jsonify({"error": "No marking scheme found for the given assignment ID"}), 404

        return jsonify({"marking_schemes": marking_schemes}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get Marking Scheme by ID
@marking_scheme_bp.route("/markingSchemes/<id>", methods=["GET"])
def get_marking_scheme_by_id(id):
    try:
        db = current_app.db
        marking_scheme_ref = db.collection("marking_schemes").document(id)
        marking_scheme = marking_scheme_ref.get()

        if marking_scheme.exists:
            return jsonify(marking_scheme.to_dict()), 200
        else:
            return jsonify({"error": "Marking scheme not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Submit Report Submission
@report_submission_bp.route("/report-submissions", methods=["POST"])
def submit_report():
    try:
        db = current_app.db
        data = request.get_json()

        report_id = db.collection("report_submissions").document().id  # Generate a document ID
        report_data = {
            "report_id": report_id,  
            "module_code": data.get("moduleCode"),
            "submission_date": datetime.now().isoformat(),
            "status": data.get("status"),
            "submission_report": data.get("submissionReport"),  # Now a URL
            "analysis_report": data.get("analysisReport"),  # Now a URL
            "aiContent": data.get("aiContent"), 
            "plagiarism": data.get("plagiarism"), 
            "student_id": data.get("studentId"),
            "mark": data.get("mark"),
            "marking_reference": data.get("markingReference"),
            "summary": data.get("summary"),
        }

        db.collection("report_submissions").document(report_id).set(report_data)

        return jsonify({"message": "Report submitted successfully!", "report": report_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400



@report_submission_bp.route("/report-submissions", methods=["GET"])
def get_all_submissions():
    try:
        db = current_app.db
        # Get all documents from the report_submissions collection
        submissions_ref = db.collection("report_submissions")
        submissions = submissions_ref.stream()

        # Prepare a list to store submission data
        submissions_data = []

        # Iterate over each submission document
        for submission in submissions:
            submission_dict = submission.to_dict()
            submission_dict["id"] = submission.id  # Add the document ID to the data
            submissions_data.append(submission_dict)

        return jsonify(submissions_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    


@report_submission_bp.route("/report-submissions/<report_id>", methods=["GET"])
def get_submission_by_id(report_id):
    try:
        db = current_app.db
        submission_ref = db.collection("report_submissions").document(report_id)
        submission = submission_ref.get()

        if submission.exists:
            submission_data = submission.to_dict()
            submission_data["id"] = submission.id  # Add document ID to response
            return jsonify(submission_data), 200
        else:
            return jsonify({"error": "Report not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 400
