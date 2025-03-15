class User:
    def __init__(self, uid, role):
        self.uid = uid
        self.role = role

    def to_dict(self):
        return {
            "uid": self.uid, 
            "role": self.role
        }

    def save(self, db):
        db.collection("users").document(self.user_id).set(self.to_dict())