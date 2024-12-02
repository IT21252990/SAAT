from flask import Blueprint, request, jsonify, current_app
import os
import zipfile
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
EXTRACT_FOLDER = 'extracted_repos'

file_upload_routes = Blueprint('file_upload_routes', __name__)

# Ensure the folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXTRACT_FOLDER, exist_ok=True)

@file_upload_routes.route('/api/upload-repo', methods=['POST'])
def upload_repo():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    # Save the file
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Extract the file
    try:
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            extract_path = os.path.join(EXTRACT_FOLDER, os.path.splitext(filename)[0])
            zip_ref.extractall(extract_path)
    except zipfile.BadZipFile:
        return jsonify({"error": "Uploaded file is not a valid zip file"}), 400

    return jsonify({"message": "File uploaded and extracted successfully", "extract_path": extract_path}), 201
