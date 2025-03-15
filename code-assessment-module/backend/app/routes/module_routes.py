from flask import Blueprint, request, jsonify, current_app

module_bp = Blueprint("module", __name__)

@module_bp.route("/create", methods=["POST"])
def create_module():
    try:
        db = current_app.db  # Use Firestore client from app context
        data = request.get_json()
        name = data.get("name")
        year = data.get("year")
        semester = data.get("semester")
        enroll_key = data.get("enroll_key")

        if not name or not year or not semester or not enroll_key:
            return jsonify({"error": "Missing required fields"}), 400

        module_ref = db.collection("modules").document()
        module_data = {
            "module_id": module_ref.id,
            "name": name,
            "year": year,
            "semester": semester,
            "enroll_key": enroll_key,
        }

        module_ref.set(module_data)
        return jsonify({"message": "Module created successfully!", "module": module_data}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@module_bp.route("/getModule/<module_id>", methods=["GET"])
def get_module(module_id):
    try:
        db = current_app.db  # Use Firestore client from app context
        module_ref = db.collection("modules").document(module_id)
        module_doc = module_ref.get()

        if module_doc.exists:
            return jsonify(module_doc.to_dict()), 200
        else:
            return jsonify({"error": "Module not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@module_bp.route("/getAllModules", methods=["GET"])
def get_all_modules():
    try:
        db = current_app.db
        modules_ref = db.collection("modules")
        modules = modules_ref.stream()

        module_list = []
        for module in modules:
            module_data = module.to_dict()
            module_data["module_id"] = module.id  # Include module ID in response
            module_list.append(module_data)

        return jsonify({"modules": module_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@module_bp.route("/getModulesByYearSemester", methods=["GET"])
def get_modules_by_year_semester():
    try:
        db = current_app.db
        year = request.args.get("year")
        semester = request.args.get("semester")

        if not year or not semester:
            return jsonify({"error": "Year and Semester are required!"}), 400

        # Query to get modules based on year and semester
        modules_ref = db.collection("modules")
        query = modules_ref.where("year", "==", int(year)).where("semester", "==", int(semester))
        modules = query.stream()

        module_list = []
        for module in modules:
            module_data = module.to_dict()
            module_list.append(module_data)

        if len(module_list) == 0:
            return jsonify({"error": "No modules found for the specified year and semester"}), 404

        return jsonify({"modules": module_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@module_bp.route("/getModuleName/<module_id>", methods=["GET"])
def get_module_name(module_id):
    try:
        db = current_app.db
        module_ref = db.collection("modules").document(module_id)
        module_doc = module_ref.get()

        if module_doc.exists:
            return jsonify(module_doc.to_dict()), 200
        else:
            return jsonify({"error": "Module not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500