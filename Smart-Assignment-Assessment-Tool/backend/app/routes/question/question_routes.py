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


@question_bp.route("/getBySubmission/<submission_id>", methods=["GET"])
def get_questions_by_submission(submission_id):
    try:
        # Get the Firestore database instance
        db = current_app.db
        
        # Query the viva_questions collection for documents matching the submission_id
        questions_ref = db.collection("viva_questions").where("submission_id", "==", submission_id)
        questions_docs = questions_ref.stream()
        
        # Process the documents to extract the questions
        all_questions = []
        
        for doc in questions_docs:
            doc_data = doc.to_dict()
            
            # Check if the document has questions
            if "questions" in doc_data and isinstance(doc_data["questions"], list):
                # Process each question in the document
                for i, q in enumerate(doc_data["questions"]):
                    # Add document metadata to each question
                    question_with_metadata = {
                        "question_text": q.get("question", ""),
                        "type": q.get("type", ""),
                        "difficulty": q.get("difficulty", ""),
                        "metric_type": q.get("metric_type", ""),
                        "answer": q.get("answer", ""),
                        "created_at": doc_data.get("created_at", datetime.now()),
                        "document_id": doc_data.get("document_id", ""),
                        "submission_id": doc_data.get("submission_id", "")
                    }
                    
                    all_questions.append(question_with_metadata)
        
        # Return the list of questions
        return jsonify({"success": True, "questions": all_questions}), 200
    
    except Exception as e:
        current_app.logger.error(f"Error fetching questions: {str(e)}")
        return jsonify({"success": False, "message": "Failed to retrieve questions", "error": str(e)}), 500