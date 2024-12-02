from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os
import zipfile
from datetime import datetime

# Define the folders
UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted_repos'

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)


# Blueprint for file upload routes
file_upload_routes = Blueprint('file_upload_routes', __name__)

@file_upload_routes.route('/api/upload-project-file', methods=['POST'])
def upload_repo_and_save_data():
    # Check if file is included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    # Save the file
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract the ZIP file
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(filename)[0])
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        return jsonify({"error": "Uploaded file is not a valid zip file"}), 400

    # Validate the student data from the form
    required_fields = ['student_name', 'student_id', 'year', 'semester', 'module_name', 'module_code']
    data = request.form.to_dict()
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Prepare data for MongoDB
    student_data = {
        "student_name": data['student_name'],
        "student_id": data['student_id'],
        "year": data['year'],
        "semester": data['semester'],
        "module_name": data['module_name'],
        "module_code": data['module_code'],
        "uploaded_file_path": file_path,
        "extracted_folder_path": extract_path,
        "created_at": datetime.now()
    }

    # Insert data into MongoDB
    # Access the database from the app configuration
    db = current_app.config['DB']
    # Insert into MongoDB
    db.student_projects.insert_one(student_data)
    # collection.insert_one(student_data)

    return jsonify({
        "message": "File uploaded, extracted, and student data saved successfully",
        "extract_path": extract_path
    }), 201
