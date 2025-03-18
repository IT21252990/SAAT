from datetime import datetime

class Code:
    def __init__(self, code_id, submission_id, github_url, comments=None, final_feedback=None, file_naming_convention_results=None, code_naming_convention_results=None, code_comments_accuracy=None):
        self.code_id = code_id
        self.submission_id = submission_id
        self.github_url = github_url
        self.comments = comments if comments else []
        self.final_feedback = final_feedback if final_feedback else []
        self.file_naming_convention_results = file_naming_convention_results if file_naming_convention_results else {}
        self.code_naming_convention_results = code_naming_convention_results if code_naming_convention_results else {}
        self.code_comments_accuracy = code_comments_accuracy if code_comments_accuracy else {}
        self.submitted_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "code_id": self.code_id,
            "submission_id": self.submission_id,
            "github_url": self.github_url,
            "comments": self.comments,
            "final_feedback": self.final_feedback,
            "file_naming_convention_results": self.file_naming_convention_results,
            "code_naming_convention_results": self.code_naming_convention_results,
            "code_comments_accuracy": self.code_comments_accuracy,
            "submitted_at": self.submitted_at
        }

    def save(self , db):
        db.collection("codes").document(self.code_id).set(self.to_dict())

    @staticmethod
    def get_github_url(db, code_id):
        """ Fetch GitHub URL by code_id """
        doc_ref = db.collection("codes").document(code_id).get()
        if doc_ref.exists:
            return doc_ref.to_dict().get("github_url")
        return None
    
    @staticmethod
    def update_file_naming_convention_results(db, code_id, results):
        """ Update naming convention results for a code submission """
        doc_ref = db.collection("codes").document(code_id)
        doc_ref.update({"file_naming_convention_results": results})
        return True
    
    @staticmethod
    def update_code_naming_convention_results(db, code_id, results):
        """ Update naming convention results for a code submission """
        doc_ref = db.collection("codes").document(code_id)
        doc_ref.update({"code_naming_convention_results": results})
        return True
    
    @staticmethod
    def update_code_comments_accuracy(db, code_id, results):
        """ Update naming convention results for a code submission """
        doc_ref = db.collection("codes").document(code_id)
        doc_ref.update({"code_comments_accuracy": results})
        return True