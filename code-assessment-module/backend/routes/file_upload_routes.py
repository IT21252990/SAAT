import os
import zipfile
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from firebase_admin import storage

# Blueprint for file upload routes
file_upload_routes = Blueprint('file_upload_routes', __name__)

# Firebase Storage bucket name
# BUCKET_NAME = "videoanalysis-d5eb4.appspot.com"
BUCKET_NAME = "videoanalysis-d5eb4.appspot.com"
bucket = storage.bucket(BUCKET_NAME)


@file_upload_routes.route('/api/upload-project-file', methods=['POST'])
def upload_repo_and_save_data():
    """Uploads a ZIP file to Firebase Storage, extracts it, and stores metadata in Firestore."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    # Secure the filename
    filename = secure_filename(file.filename)

    # Save the file temporarily
    temp_file_path = os.path.join(tempfile.gettempdir(), filename)
    file.save(temp_file_path)

    # Upload ZIP file to Firebase Storage
    bucket = storage.bucket(BUCKET_NAME)
    blob = bucket.blob(f"uploads/{filename}")
    blob.upload_from_filename(temp_file_path)
    blob.make_public()  # Make file publicly accessible (optional)

    # Get Firebase Storage URL
    file_url = blob.public_url

    # Extract ZIP contents temporarily
    extract_folder = os.path.join(tempfile.gettempdir(), os.path.splitext(filename)[0])
    os.makedirs(extract_folder, exist_ok=True)

    try:
        with zipfile.ZipFile(temp_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_folder)
    except zipfile.BadZipFile:
        return jsonify({"error": "Uploaded file is not a valid zip file"}), 400

    # Upload extracted files to Firebase Storage
    extracted_files_urls = []
    for root, _, files in os.walk(extract_folder):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            storage_path = f"extracted/{os.path.basename(extract_folder)}/{file_name}"
            
            extracted_blob = bucket.blob(storage_path)
            extracted_blob.upload_from_filename(file_path)
            extracted_blob.make_public()  # Make file publicly accessible (optional)
            
            extracted_files_urls.append({
                "file_name": file_name,
                "firebase_url": extracted_blob.public_url
            })

    # Validate student data from the form
    required_fields = ['student_name', 'student_id', 'year', 'semester', 'module_name', 'module_code']
    data = request.form.to_dict()
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    # Prepare data for Firestore
    student_data = {
        "student_name": data['student_name'],
        "student_id": data['student_id'],
        "year": data['year'],
        "semester": data['semester'],
        "module_name": data['module_name'],
        "module_code": data['module_code'],
        "uploaded_file_url": file_url,  # Store Firebase Storage URL instead of local path
        "extracted_files": extracted_files_urls,  # Store Firebase URLs for extracted files
        "created_at": datetime.utcnow().isoformat()
    }

    # Store data in Firestore
    db = current_app.config['DB']
    db.collection("student_projects").add(student_data)

    # Cleanup: Remove temporary files
    os.remove(temp_file_path)  # Remove ZIP file
    for root, _, files in os.walk(extract_folder):
        for file_name in files:
            os.remove(os.path.join(root, file_name))
    os.rmdir(extract_folder)

    return jsonify({
        "message": "File uploaded to Firebase, extracted, and data saved successfully",
        "uploaded_file_url": file_url,
        "extracted_files": extracted_files_urls
    }), 201
