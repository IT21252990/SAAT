from flask import Blueprint, request, jsonify, current_app

user_bp = Blueprint("user", __name__)

@user_bp.route("/saveUserRole", methods=["POST"])
def save_user_role():
    try:
        db = current_app.db  # Use Firestore client from app context
        data = request.get_json()
        uid = data.get("uid")
        role = data.get("role")

        if not uid or not role:
            return jsonify({"error": "Missing user ID or role"}), 400

        user_ref = db.collection("users").document(uid)
        user_ref.set({"role": role})

        return jsonify({"message": "User role saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route("/getUserRole/<uid>", methods=["GET"])
def get_user_role(uid):
    try:
        db = current_app.db  # Use Firestore client from app context
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify({"role": user_doc.to_dict().get("role")}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@user_bp.route("/getAllUsers", methods=["GET"])
def get_all_users():
    try:
        db = current_app.db
        users_ref = db.collection("users")
        users = users_ref.stream()

        user_list = []
        for user in users:
            user_data = user.to_dict()
            user_data["uid"] = user.id  # Include UID in response
            user_list.append(user_data)

        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500