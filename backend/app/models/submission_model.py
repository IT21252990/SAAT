from datetime import datetime

class Submission:
    def __init__(self, submission_id, user_id, assignment_id, code_id, report_id, video_id):
        self.submission_id = submission_id
        self.user_id = user_id  # Document ID reference to User
        self.assignment_id = assignment_id  # Document ID reference to Assignment
        self.code_id = code_id
        self.report_id = report_id
        self.video_id = video_id
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "submission_id": self.submission_id,
            "user_id": self.user_id,
            "assignment_id": self.assignment_id,
            "code_id": self.code_id,
            "report_id": self.report_id,
            "video_id": self.video_id,
            "created_at": self.created_at
        }

    def save(self, db):
        db.collection("submissions").document(self.submission_id).set(self.to_dict())

