class MarkingScheme:
    def __init__(self, user_id, module_code, start_date, due_date, status, title, criteria, assignment_id):
        self.user_id = user_id  # User ID
        self.module_code = module_code
        self.start_date = start_date
        self.due_date = due_date
        self.status = status
        self.assignment_id = assignment_id
        self.title = title
        self.criteria = criteria  # List of dictionaries containing criterion details

    def to_dict(self):
        return {
            "user_id": self.user_id,  # Added user_id to the dictionary
            "module_code": self.module_code,
            "start_date": self.start_date,
            "due_date": self.due_date,
            "status": self.status,
            "assignment_id": self.assignment_id,
            "title": self.title,
            "criteria": self.criteria,  # Example: [{'criterion': 'Accuracy', 'weightage': 20, 'subCriteria': [{'description': 'Correctness of algorithm', 'points': 10}]}]
        }

    def save(self, db):
        db.collection("marking_schemes").document(self.module_code).set(self.to_dict())
