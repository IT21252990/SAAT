class User:
    def __init__(self, uid, role):
        self.uid = uid
        self.role = role

    def to_dict(self):
        return {"uid": self.uid, "role": self.role}
