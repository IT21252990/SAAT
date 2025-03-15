from flask import Blueprint, request, jsonify, current_app

user_bp = Blueprint("user", __name__)

# Save User (ID, Email, Role)
@user_bp.route("/saveUser", methods=["POST"])
def save_user():
    try:
        db = current_app.db
        data = request.get_json()

        uid = data.get("uid")
        email = data.get("email")
        role = data.get("role")

        if not uid or not email or not role:
            return jsonify({"error": "Missing required fields"}), 400

        # Save user data in Firestore
        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "uid": uid,
            "email": email,
            "role": role
        })

        return jsonify({"message": "User saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get User by UID
@user_bp.route("/getUser/<uid>", methods=["GET"])
def get_user(uid):
    try:
        db = current_app.db
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify(user_doc.to_dict()), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get All Users
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