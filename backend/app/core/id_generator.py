from datetime import datetime
import uuid

def generate_uid(prefix: str):
    year = datetime.utcnow().year
    short = uuid.uuid4().hex[:6].upper()
    return f"{prefix}-{year}-{short}"
