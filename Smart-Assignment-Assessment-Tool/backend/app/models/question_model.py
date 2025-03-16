class Question:
    def __init__(self, question_id, question, answer, level, submission_id):
        self.question_id = question_id
        self.question = question
        self.answer = answer
        self.level = level  # Difficulty level (e.g., "Easy", "Medium", "Hard")
        self.submission_id = submission_id  # Document ID reference to Submission

    def to_dict(self):
        return {
            "question_id": self.question_id,
            "question": self.question,
            "answer": self.answer,
            "level": self.level,
            "submission_id": self.submission_id
        }

    def save(self, db):
        db.collection("questions").document(self.question_id).set(self.to_dict())