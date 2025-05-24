from flask import Blueprint, request, jsonify, current_app
import uuid

project_bp = Blueprint("project", __name__)

@project_bp.route("/getFullWebsiteDetails", methods=["GET"])
def get_full_website_details():
    try:
        db = current_app.db

        # 🔹 Get all users
        users = [doc.to_dict() for doc in db.collection("users").stream()]

        # 🔹 Get all modules
        modules_list = []
        modules_query = db.collection("modules").stream()

        for module_doc in modules_query:
            module_data = module_doc.to_dict()
            module_id = module_data.get("module_id")
            module_data["assignments"] = []

            # 🔸 Get assignments of this module
            assignments_query = db.collection("assignments").where("module_id", "==", module_id).stream()
            for assignment_doc in assignments_query:
                assignment_data = assignment_doc.to_dict()
                assignment_id = assignment_data.get("assignment_id")

                # 🔸 Get submissions for this assignment
                submissions_query = db.collection("submissions").where("assignment_id", "==", assignment_id).stream()
                submissions = [sub_doc.to_dict() for sub_doc in submissions_query]

                # 🔸 Append submissions to assignment
                assignment_data["submissions"] = submissions

                # 🔸 Add this assignment to the module
                module_data["assignments"].append(assignment_data)

            # 🔸 Add fully populated module to list
            modules_list.append(module_data)

        return jsonify({
            "message": "Admin dashboard data fetched",
            "data": {
                "users": users,
                "modules": modules_list
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
