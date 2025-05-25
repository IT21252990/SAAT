from flask import Blueprint, request, jsonify, current_app
import datetime

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

@user_bp.route("/registerStudent", methods=["POST"])
def register_student():
    try:
        db = current_app.db
        data = request.get_json()

        # Validate required fields
        required_fields = ["uid", "email", "studentName", "studentId", "academicYear", "academicSemester"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        uid = data.get("uid")
        email = data.get("email")
        role = data.get("role", "student")  # Default role is student
        studentName = data.get("studentName")
        studentId = data.get("studentId")
        academicYear = data.get("academicYear")
        academicSemester = data.get("academicSemester")
        createdAt = data.get("createdAt", datetime.datetime.utcnow().isoformat())

        # Generate profile picture URL
        name_parts = studentName.strip().split()
        first_name = name_parts[0] if len(name_parts) > 0 else "User"
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        # Clean last name by removing special characters and spaces
        cleaned_last_name = "".join([c for c in last_name if c.isalnum()]).upper()
        
        # Generate profile picture URL
        profile_pic_url = f"https://avatar.iran.liara.run/username?username={first_name}+{cleaned_last_name}"

        # Check if student ID already exists
        existing_student = db.collection("users").where("studentId", "==", studentId.strip()).limit(1).get()
        if len(existing_student) > 0:
            return jsonify({"error": "Student ID already exists"}), 400

        # Save user data in Firestore
        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "uid": uid,
            "email": email,
            "role": role,
            "studentName": studentName.strip(),
            "studentId": studentId.strip(),
            "academicYear": academicYear,
            "academicSemester": academicSemester,
            "profilePicUrl": profile_pic_url,
            "createdAt": createdAt,
            "status": "active"  # default status
        })

        return jsonify({
            "message": "Student registered successfully!",
            "profilePicUrl": profile_pic_url,
            "studentId": studentId.strip(),
            "uid": uid
        }), 200

    except Exception as e:
        print(f"Error in register_student: {str(e)}")  # For debugging
        return jsonify({"error": str(e)}), 500
    
@user_bp.route("/registerteacher", methods=["POST"])
def register_teacher():
    try:
        db = current_app.db
        data = request.get_json()

        # Validate required fields
        required_fields = ["uid", "email", "studentName"]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Missing required field: {field}"}), 400

        uid = data.get("uid")
        email = data.get("email")
        role = data.get("role", "teacher")  # Default role is teacher
        studentName = data.get("studentName")
        createdAt = data.get("createdAt", datetime.datetime.utcnow().isoformat())

        # Generate profile picture URL
        name_parts = studentName.strip().split()
        first_name = name_parts[0] if len(name_parts) > 0 else "User"
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        # Clean last name by removing special characters and spaces
        cleaned_last_name = "".join([c for c in last_name if c.isalnum()]).upper()
        
        # Generate profile picture URL
        profile_pic_url = f"https://avatar.iran.liara.run/username?username={first_name}+{cleaned_last_name}"

        # Save teacher data in Firestore
        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "uid": uid,
            "email": email,
            "role": role,
            "studentName": studentName.strip(),
            "profilePicUrl": profile_pic_url,
            "createdAt": createdAt,
            "status": "active"
        })

        return jsonify({
            "profilePicUrl": profile_pic_url,
            "uid": uid,
            "role": role,
            "studentName": studentName.strip(),
            "email": email,
            "createdAt": createdAt,
            "status": "active"
        }), 200

    except Exception as e:
        print(f"Error in register_teacher: {str(e)}")  # For debugging
        return jsonify({"error": str(e)}), 500
    

# Delete User by UID
@user_bp.route("/deleteUser/<uid>", methods=["DELETE"])
def delete_user(uid):
    try:
        db = current_app.db
        
        # Check if user exists
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        # Get user data before deletion for response
        user_data = user_doc.to_dict()
        
        # Delete the user document
        user_ref.delete()
        
        return jsonify({
            "message": "User deleted successfully!",
            "deletedUser": {
                "uid": uid,
                "email": user_data.get("email"),
                "role": user_data.get("role"),
                "studentName": user_data.get("studentName")
            }
        }), 200
        
    except Exception as e:
        print(f"Error in delete_user: {str(e)}")  # For debugging
        return jsonify({"error": str(e)}), 500