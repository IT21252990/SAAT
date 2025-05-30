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
        criteria = data.get("criteria")  # Now expects: {"code": [], "report": [], "video": []}
        module_code = data.get("moduleCode")
        assignment_id = data.get("assignment_id")
        submission_types = data.get("submissionTypes", {})  # Get selected submission types
        submission_type_weights  = data.get("submissionTypeWeights", {})  # Get weights for each submission type
        # tutor = request.user["_id"] if request.user else None  # Assuming user info is stored in request

        if not rubric_name or not criteria or not module_code:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Validate submission type weights
        if submission_types:
            total_weight = sum(
                weight for type, weight in submission_type_weights.items() 
                if submission_types.get(type, False)
            )
            if total_weight != 100:
                return jsonify({
                    "error": f"Submission type weights must total 100%. Current total: {total_weight}%"
                }), 400

        # Process criteria for each submission type
        processed_criteria = {}
        
        # Process code criteria if code submission is enabled
        if submission_types.get("code", False) and criteria.get("code"):
            processed_criteria["code"] = [
                {
                    "criterion": criterion["name"],
                    "low_description": criterion["lowDescription"],
                    "medium_description": criterion["mediumDescription"],
                    "high_description": criterion["highDescription"],
                    "weightage": criterion["weight"],
                    "type_weight": submission_type_weights.get("code", 0)
                } for criterion in criteria["code"]
            ]

        # Process report criteria if report submission is enabled
        if submission_types.get("report", False) and criteria.get("report"):
            processed_criteria["report"] = [
                {
                    "criterion": criterion["name"],
                    "low_description": criterion["lowDescription"],
                    "medium_description": criterion["mediumDescription"],
                    "high_description": criterion["highDescription"],
                    "weightage": criterion["weight"],
                    "type_weight": submission_type_weights.get("report", 0)
                } for criterion in criteria["report"]
            ]

        # Process video criteria if video submission is enabled
        if submission_types.get("video", False) and criteria.get("video"):
            processed_criteria["video"] = [
                {
                    "criterion": criterion["name"],
                    "low_description": criterion["lowDescription"],
                    "medium_description": criterion["mediumDescription"],
                    "high_description": criterion["highDescription"],
                    "weightage": criterion["weight"],
                    "type_weight": submission_type_weights.get("video", 0)
                } for criterion in criteria["video"]
            ]

        # Process Viva criteria if video submission is enabled
        if submission_types.get("viva", False) and criteria.get("viva"):
            processed_criteria["viva"] = [
                {
                    "criterion": criterion["name"],
                    "low_description": criterion["lowDescription"],
                    "medium_description": criterion["mediumDescription"],
                    "high_description": criterion["highDescription"],
                    "weightage": criterion["weight"],
                    "type_weight": submission_type_weights.get("viva", 0)
                } for criterion in criteria["viva"]
            ]

        # Create new marking scheme document
        marking_scheme_ref = db.collection("marking_schemes").document()
        marking_scheme_ref.set({
            "title": rubric_name,
            "module_code": module_code,
            "status": "Active",
            "assignment_id": assignment_id,
            "criteria": processed_criteria,  # Now stores as {"code": [], "report": [], "video": []}
            "submission_types": submission_types,  # Store which submission types are enabled
            "submission_type_weights": submission_type_weights,  # Store weights for each submission type
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



# Update Student Mark and Status to Reviewed
@report_submission_bp.route("/report-submissions/<report_id>/review", methods=["PUT"])
def update_student_mark_and_status(report_id):
    """
    Update a specific student's mark and set status to 'reviewed'
    Expected JSON payload:
    {
        "mark": 85,
        "feedback": "Optional feedback from instructor"
    }
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        # Validate required fields
        if "mark" not in data:
            return jsonify({"error": "Mark is required"}), 400
        
        mark = data.get("mark")
        feedback = data.get("feedback", "")
        
        # Validate mark range
        if not isinstance(mark, (int, float)) or mark < 0 or mark > 100:
            return jsonify({"error": "Mark must be a number between 0 and 100"}), 400
        
        # Check if the report exists
        submission_ref = db.collection("report_submissions").document(report_id)
        submission = submission_ref.get()
        
        if not submission.exists:
            return jsonify({"error": "Report not found"}), 404
        
        # Prepare update data
        update_data = {
            "mark": mark,
            "status": "reviewed",
            "reviewed_date": datetime.now().isoformat(),
            "instructor_feedback": feedback
        }
        
        # Update the document
        submission_ref.update(update_data)
        
        # Get the updated document to return
        updated_submission = submission_ref.get()
        updated_data = updated_submission.to_dict()
        updated_data["id"] = updated_submission.id
        
        return jsonify({
            "message": "Student mark and status updated successfully!",
            "report": updated_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Publish All Submissions for Specific Assignment
@report_submission_bp.route("/report-submissions/publish-assignment", methods=["PUT"])
def publish_assignment_submissions():
    """
    Update all submissions for a specific assignment to 'published' status
    This will change ALL statuses (submitted, reviewed, etc.) to published for the given assignment
    Required JSON payload:
    {
        "marking_reference": "assignment_123"  # Required: Assignment ID to publish
    }
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        # Validate required field
        if not data or "marking_reference" not in data:
            return jsonify({"error": "marking_reference is required"}), 400
        
        marking_reference = data.get("marking_reference")
        
        if not marking_reference:
            return jsonify({"error": "marking_reference cannot be empty"}), 400
        
        # Query all submissions for this specific assignment
        submissions_ref = db.collection("report_submissions")
        query = submissions_ref.where("marking_reference", "==", marking_reference)
        
        # Get all matching submissions
        submissions = list(query.stream())
        
        if not submissions:
            return jsonify({
                "message": f"No submissions found for assignment: {marking_reference}",
                "updated_count": 0,
                "assignment_id": marking_reference
            }), 200
        
        # Track status changes for reporting
        status_changes = {"submitted": 0, "reviewed": 0, "published": 0, "other": 0}
        batch = db.batch()  # Use batch for efficient bulk updates
        
        # Prepare batch updates
        for submission in submissions:
            submission_data = submission.to_dict()
            current_status = submission_data.get("status", "submitted")
            
            # Track current status for reporting
            if current_status in status_changes:
                status_changes[current_status] += 1
            else:
                status_changes["other"] += 1
            
            submission_ref = db.collection("report_submissions").document(submission.id)
            
            update_data = {
                "status": "published",
                "published_date": datetime.now().isoformat(),
                "previous_status": current_status  # Keep track of what it was before
            }
            
            batch.update(submission_ref, update_data)
        
        # Execute batch update
        batch.commit()
        
        total_updated = len(submissions)
        
        return jsonify({
            "message": f"Successfully published all {total_updated} submissions for assignment: {marking_reference}",
            "assignment_id": marking_reference,
            "updated_count": total_updated,
            "status_breakdown": {
                "previously_submitted": status_changes["submitted"],
                "previously_reviewed": status_changes["reviewed"],
                "previously_published": status_changes["published"],
                "other_statuses": status_changes["other"]
            }
        }), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Bulk Update Multiple Submissions
@report_submission_bp.route("/report-submissions/bulk-update", methods=["PUT"])
def bulk_update_submissions():
    """
    Update multiple submissions at once
    Expected JSON payload:
    {
        "updates": [
            {
                "report_id": "report_123",
                "mark": 85,
                "feedback": "Good work"
            },
            {
                "report_id": "report_456",
                "mark": 92,
                "feedback": "Excellent"
            }
        ]
    }
    """
    try:
        db = current_app.db
        data = request.get_json()
        
        if "updates" not in data or not isinstance(data["updates"], list):
            return jsonify({"error": "Updates array is required"}), 400
        
        updates = data["updates"]
        
        if len(updates) == 0:
            return jsonify({"error": "At least one update is required"}), 400
        
        batch = db.batch()
        successful_updates = []
        failed_updates = []
        
        for update in updates:
            try:
                report_id = update.get("report_id")
                mark = update.get("mark")
                feedback = update.get("feedback", "")
                
                if not report_id:
                    failed_updates.append({"update": update, "error": "Missing report_id"})
                    continue
                
                if mark is None:
                    failed_updates.append({"update": update, "error": "Missing mark"})
                    continue
                
                # Validate mark
                if not isinstance(mark, (int, float)) or mark < 0 or mark > 100:
                    failed_updates.append({"update": update, "error": "Invalid mark range"})
                    continue
                
                # Check if document exists
                submission_ref = db.collection("report_submissions").document(report_id)
                submission = submission_ref.get()
                
                if not submission.exists:
                    failed_updates.append({"update": update, "error": "Report not found"})
                    continue
                
                # Prepare update data
                update_data = {
                    "mark": mark,
                    "status": "reviewed",
                    "reviewed_date": datetime.now().isoformat(),
                    "instructor_feedback": feedback
                }
                
                batch.update(submission_ref, update_data)
                successful_updates.append(report_id)
                
            except Exception as e:
                failed_updates.append({"update": update, "error": str(e)})
        
        # Execute batch update if there are successful updates
        if successful_updates:
            batch.commit()
        
        response_data = {
            "message": f"Bulk update completed. {len(successful_updates)} successful, {len(failed_updates)} failed.",
            "successful_updates": successful_updates,
            "failed_updates": failed_updates,
            "total_processed": len(updates)
        }
        
        status_code = 200 if len(failed_updates) == 0 else 207  # 207 = Multi-Status
        
        return jsonify(response_data), status_code
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Get Submissions by Status
@report_submission_bp.route("/report-submissions/status/<status>", methods=["GET"])
def get_submissions_by_status(status):
    """
    Get all submissions filtered by status
    Optional query parameters:
    - module_code: Filter by module code
    - marking_reference: Filter by assignment
    """
    try:
        db = current_app.db
        
        # Validate status
        valid_statuses = ["submitted", "reviewed", "published"]
        if status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        
        # Build query
        query = db.collection("report_submissions").where("status", "==", status)
        
        # Apply additional filters from query parameters
        module_code = request.args.get("module_code")
        marking_reference = request.args.get("marking_reference")
        
        if module_code:
            query = query.where("module_code", "==", module_code)
        
        if marking_reference:
            query = query.where("marking_reference", "==", marking_reference)
        
        # Execute query
        submissions = query.stream()
        
        submissions_data = []
        for submission in submissions:
            submission_dict = submission.to_dict()
            submission_dict["id"] = submission.id
            submissions_data.append(submission_dict)
        
        return jsonify({
            "status": status,
            "count": len(submissions_data),
            "submissions": submissions_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Get Submission Statistics
@report_submission_bp.route("/report-submissions/statistics", methods=["GET"])
def get_submission_statistics():
    """
    Get statistics about submissions
    Optional query parameters:
    - module_code: Filter by module code
    - marking_reference: Filter by assignment
    """
    try:
        db = current_app.db
        
        # Build base query
        base_query = db.collection("report_submissions")
        
        # Apply filters from query parameters
        module_code = request.args.get("module_code")
        marking_reference = request.args.get("marking_reference")
        
        query_filters = []
        if module_code:
            query_filters.append(("module_code", "==", module_code))
        if marking_reference:
            query_filters.append(("marking_reference", "==", marking_reference))
        
        # Get all submissions with filters
        query = base_query
        for field, operator, value in query_filters:
            query = query.where(field, operator, value)
        
        submissions = list(query.stream())
        
        # Calculate statistics
        total_submissions = len(submissions)
        status_counts = {"submitted": 0, "reviewed": 0, "published": 0}
        total_marks = 0
        marked_submissions = 0
        
        for submission in submissions:
            data = submission.to_dict()
            status = data.get("status", "submitted")
            
            if status in status_counts:
                status_counts[status] += 1
            
            mark = data.get("mark")
            if mark is not None and isinstance(mark, (int, float)):
                total_marks += mark
                marked_submissions += 1
        
        # Calculate average mark
        average_mark = round(total_marks / marked_submissions, 2) if marked_submissions > 0 else 0
        
        statistics = {
            "total_submissions": total_submissions,
            "status_breakdown": status_counts,
            "average_mark": average_mark,
            "marked_submissions": marked_submissions,
            "unmarked_submissions": total_submissions - marked_submissions
        }
        
        # Add filter information if any filters were applied
        if query_filters:
            filter_info = {}
            if module_code:
                filter_info["module_code"] = module_code
            if marking_reference:
                filter_info["marking_reference"] = marking_reference
            statistics["filters_applied"] = filter_info
        
        return jsonify(statistics), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400