import uuid
from datetime import datetime

class Question:
    def __init__(self, question_id, submission_id, type_, metric_type, question_text, answer, created_at=None):
        self.document_id = str(uuid.uuid4())  # Auto-generate document ID
        self.submission_id = submission_id
        self.type = type_  # The type of the question, e.g., "general", "code", "report"
        self.metric_type = metric_type  # Metrics within each type, e.g., "understanding", "efficiency"
        self.question_text = question_text  # The actual question
        self.answer = answer  # The answer to the question
        self.created_at = created_at or datetime.now()  # If no created_at, use current time
        
    def to_dict(self):
        return {
            "document_id": self.document_id,
            "submission_id": self.submission_id,
            "type": self.type,
            "metric_type": self.metric_type,
            "question_text": self.question_text,
            "answer": self.answer,
            "created_at": self.created_at.isoformat()  # Store datetime in ISO format
        }

    def save(self, db):
        """
        Saves the question to Firestore under 'viva_questions' collection.
        """
        # Get a reference to Firestore collection
        db.collection("viva_questions").document(self.document_id).set(self.to_dict())
