from dataclasses import dataclass

@dataclass
class User:
    def __init__(self, id: int, username: str, password_hash: str, role: str):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.role = role

