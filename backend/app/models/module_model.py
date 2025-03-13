class Module:
    def __init__(self, module_id, name, year, semester, enroll_key):
        self.module_id = module_id
        self.name = name
        self.year = year
        self.semester = semester
        self.enroll_key = enroll_key  # Key required for students to enroll

    def to_dict(self):
        return {
            "module_id": self.module_id,
            "name": self.name,
            "year": self.year,
            "semester": self.semester,
            "enroll_key": self.enroll_key
        }

    def save(self, db):
        db.collection("modules").document(self.module_id).set(self.to_dict())
