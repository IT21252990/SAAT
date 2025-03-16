from datetime import datetime

class Code:
    def __init__(self, code_id, submission_id, github_url, comments=None, final_feedback=None):
        self.code_id = code_id
        self.submission_id = submission_id
        self.github_url = github_url
        self.comments = comments if comments else []
        self.final_feedback = final_feedback if final_feedback else []
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "code_id": self.code_id,
            "submission_id": self.submission_id,
            "github_url": self.github_url,
            "comments": self.comments,
            "final_feedback": self.final_feedback,
            "created_at": self.created_at
        }

    def save(self , db):
        db.collection("codes").document(self.code_id).set(self.to_dict())
