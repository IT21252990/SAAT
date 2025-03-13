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
        marking = data.get("marking")  # Should be a list of {criteria, allocated_mark}
        
        if not module_id or not name or not marking:
            return jsonify({"error": "Missing required fields"}), 400
        
        assignment_id = str(uuid.uuid4())  # Generate a unique assignment ID

        # Save in Firestore
        assignment_ref = db.collection("assignments").document(assignment_id)
        assignment_ref.set({
            "assignment_id": assignment_id,
            "module_id": module_id,
            "name": name,
            "marking": marking  # Store as an array of objects
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

        assignment_list = []
        for assignment in assignments:
            assignment_list.append(assignment.to_dict())

        return jsonify({"assignments": assignment_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
