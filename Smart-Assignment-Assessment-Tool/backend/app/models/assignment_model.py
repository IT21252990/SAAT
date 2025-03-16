class Assignment:
    def __init__(self, assignment_id, name, module_id, marking):
        self.assignment_id = assignment_id
        self.name = name
        self.module_id = module_id  # Document ID reference to Modules
        self.marking = marking  # List of criteria and allocated marks

    def to_dict(self):
        return {
            "assignment_id": self.assignment_id,
            "name": self.name,
            "module_id": self.module_id,  # Stores document ID reference
            "marking": self.marking  # Example: [{"criteria": "Code Quality", "allocated_mark": 20}]
        }

    def save(self, db):
        db.collection("assignments").document(self.assignment_id).set(self.to_dict())