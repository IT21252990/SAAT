from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
import uuid

question_bp = Blueprint('question_bp', __name__)

@question_bp.route("/saveVivaQuestions", methods=["POST"])
def save_viva_questions():
    try:
        # Get the data from the request
        data = request.get_json()
        submission_id = data.get("submission_id")
        questions = data.get("questions")

        # Validate the input
        if not submission_id or not questions:
            return jsonify({"error": "Missing submission_id or questions"}), 400

        # Create a unique document ID for the viva question document
        document_id = str(uuid.uuid4())

        # Prepare the document data
        question_data = {
            "document_id": document_id,
            "submission_id": submission_id,
            "questions": questions,
            "created_at": datetime.now()
        }

        # Add the document to Firestore
        db = current_app.db
        question_ref = db.collection("viva_questions").document(document_id)
        question_ref.set(question_data)

        return jsonify({"message": "Viva questions added successfully", "document_id": document_id}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @question_bp.route("/getVivaQuestions/<submission_id>", methods=["GET"])
@question_bp.route("/getVivaQuestions/<document_id>", methods=["GET"])
def get_viva_questions(document_id):
    try:
        # Fetch the document for the given document_id from Firestore
        db = current_app.db
        question_ref = db.collection("viva_questions").document(document_id)
        question_doc = question_ref.get()

        if not question_doc.exists:
            return jsonify({"error": "No questions found for this document ID"}), 404

        # Return the viva question data
        viva_question_data = question_doc.to_dict()
        
        return jsonify({"viva_question": viva_question_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
