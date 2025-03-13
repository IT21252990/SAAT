from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("firebase-adminsdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route("/saveUserRole", methods=["POST"])
def save_user_role():
    try:
        data = request.get_json()  # Get JSON data from frontend
        uid = data.get("uid")  # Firebase UID of the user
        role = data.get("role")  # Role selected during registration

        if not uid or not role:
            return jsonify({"error": "Missing user ID or role"}), 400

        # Save user role in Firebase Firestore
        user_ref = db.collection("users").document(uid)
        user_ref.set({"role": role})

        return jsonify({"message": "User role saved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getUserRole/<uid>", methods=["GET"])
def get_user_role(uid):
    try:
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if user_doc.exists:
            return jsonify({"role": user_doc.to_dict().get("role")}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
