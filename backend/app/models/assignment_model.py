class Assignment:
    def __init__(self, assignment_id, name, module_id, description, deadline, submission_types, marking_criteria, details):
        self.assignment_id = assignment_id
        self.name = name
        self.module_id = module_id  # Document ID reference to Modules
        self.description = description  # Assignment description
        self.deadline = deadline  # Due date
        self.submission_types = submission_types  # Dict: { "code": True/False, "report": True/False, "video": True/False }
        self.marking_criteria = marking_criteria  # Dict of marking criteria for each submission type
        self.details = details  # Nested structure for assignment topics, descriptions, and subtopics

    def to_dict(self):
        return {
            "assignment_id": self.assignment_id,
            "name": self.name,
            "module_id": self.module_id,
            "description": self.description,
            "deadline": self.deadline,
            "submission_types": self.submission_types,
            "marking_criteria": self.marking_criteria,  # Example: {"code": [{"criteria": "Efficiency", "allocated_mark": 10}], "report": []}
            "details": self.details,  # Example: [{"topic": "Sorting", "description": "Implement sorting", "subtopics": [...]}]
        }

    def save(self, db):
        db.collection("assignments").document(self.assignment_id).set(self.to_dict())
