class MarkingScheme:
    def __init__(self, user_id, module_code, start_date, due_date, status, title, criteria, assignment_id, submission_types=None, submission_type_weights=None):
        self.user_id = user_id  # User ID
        self.module_code = module_code
        self.start_date = start_date
        self.due_date = due_date
        self.status = status
        self.assignment_id = assignment_id
        self.title = title
        self.criteria = criteria  # Dict of marking criteria for each submission type
        self.submission_types = submission_types or {} 
        self.submission_type_weights = submission_type_weights or {}

    def to_dict(self):
        return {
            "user_id": self.user_id,  # user_id to the dictionary
            "module_code": self.module_code,
            "start_date": self.start_date,
            "due_date": self.due_date,
            "status": self.status,
            "assignment_id": self.assignment_id,
            "title": self.title,
            "criteria": self.criteria,  # Example: {"code": [{}], "report": [{}], "video": [{}]}
            "submission_types": self.submission_types,
            "submission_type_weights": self.submission_type_weights
        }

    def save(self, db):
        db.collection("marking_schemes").document(self.module_code).set(self.to_dict())
