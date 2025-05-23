from flask import Blueprint, request, jsonify, current_app
import uuid

assignment_bp = Blueprint("assignment", __name__)

# Create Assignment
@assignment_bp.route("/createAssignment", methods=["POST"])
def create_assignment():
    try:
        db = current_app.db
        data = request.get_json()
        
        module_id = data.get("module_id")
        name = data.get("name")
        description = data.get("description")
        deadline = data.get("deadline")
        submission_types = data.get("submission_types")  # {"code": True/False, "report": True/False, "video": True/False}
        marking_criteria = data.get("markingCriteria")  # Dict for different submission types
        details = data.get("details")  # Topics, descriptions, subtopics
        
        if not module_id or not name or not marking_criteria:
            return jsonify({"error": "Missing required fields"}), 400
        
        assignment_id = str(uuid.uuid4())  # Generate a unique assignment ID

        # Save in Firestore
        assignment_ref = db.collection("assignments").document(assignment_id)
        assignment_ref.set({
            "assignment_id": assignment_id,
            "module_id": module_id,
            "name": name,
            "description": description,
            "deadline": deadline,
            "submission_types": submission_types,
            "marking_criteria": marking_criteria,
            "details": details
        })

        return jsonify({"message": "Assignment created successfully!", "assignment_id": assignment_id}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get Assignments by Module ID
@assignment_bp.route("/getAssignmentsByModule/<module_id>", methods=["GET"])
def get_assignments_by_module(module_id):
    try:
        db = current_app.db
        assignments_ref = db.collection("assignments").where("module_id", "==", module_id)
        assignments = assignments_ref.stream()

        assignment_list = [assignment.to_dict() for assignment in assignments]
        
        return jsonify({"assignments": assignment_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@assignment_bp.route("/getAssignment/<assignment_id>", methods=["GET"])
def get_assignment(assignment_id):
    try:
        db = current_app.db
        assignment_ref = db.collection("assignments").document(assignment_id)
        assignment_doc = assignment_ref.get()

        if assignment_doc.exists:
            return jsonify(assignment_doc.to_dict()), 200
        else:
            return jsonify({"error": "Assignment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Edit Assignment
@assignment_bp.route("/updateAssignment/<assignment_id>", methods=["PUT"])
def update_assignment(assignment_id):
    try:
        db = current_app.db
        data = request.get_json()

        assignment_ref = db.collection("assignments").document(assignment_id)

        # Get the existing document
        existing_assignment = assignment_ref.get()
        if not existing_assignment.exists:
            return jsonify({"error": "Assignment not found"}), 404

        # Update fields
        assignment_ref.update({
            "name": data.get("name", existing_assignment.get("name")),
            "description": data.get("description", existing_assignment.get("description")),
            "deadline": data.get("deadline", existing_assignment.get("deadline")),
            # Update other fields like submission types, details, etc.
        })

        return jsonify({"message": "Assignment updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete Assignment
@assignment_bp.route("/deleteAssignment/<assignment_id>", methods=["DELETE"])
def delete_assignment(assignment_id):
    try:
        db = current_app.db
        assignment_ref = db.collection("assignments").document(assignment_id)

        # Check if the assignment exists
        if not assignment_ref.get().exists:
            return jsonify({"error": "Assignment not found"}), 404

        # Delete the assignment document
        assignment_ref.delete()

        return jsonify({"message": "Assignment deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
