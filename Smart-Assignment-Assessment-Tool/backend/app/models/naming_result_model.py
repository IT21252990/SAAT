def format_violation(file, category, name, message):
    return {
        "file": file,
        "category": category,
        "name": name,
        "message": message
    }

from datetime import datetime

class Naming_Violation:
    def __init__(self,violation_id, file_path, category, name, message):
        self.violation_id = violation_id
        self.file_path = file_path
        self.category = category
        self.name = name
        self.message = message
        self.created_at = datetime.utcnow().isoformat()

    def to_dict(self):
        return {
            "violation_id": self.violation_id,
            "file_path": self.file_path,
            "category": self.category,
            "name": self.name,
            "message": self.message,
            "created_at": self.created_at
        }

    def save(self , db):
        db.collection("Naming_Violation").document(self.violation_id).set(self.to_dict())
