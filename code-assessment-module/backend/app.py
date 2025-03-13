import os
from dotenv import load_dotenv
from flask import Flask , jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from routes.repo_routes import repo_routes
from routes.file_upload_routes import file_upload_routes

load_dotenv()  # Load environment variables from .env

# Get Firebase credentials path from environment
firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS")

if not firebase_credentials_path:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set!")

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(firebase_credentials_path)
    firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

app = Flask(__name__)
CORS(app)

# Pass the Firestore instance to blueprints
app.config['DB'] = db

app.register_blueprint(repo_routes)
app.register_blueprint(file_upload_routes)

@app.route('/')
def index():
    return "GitHub Project Assessment Tool Backend (Firebase Connected)"

# Health check route
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Try to fetch Firestore collections to check the connection
        collections = db.collections()
        return jsonify({"status": "success", "message": "Firebase connected successfully!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
