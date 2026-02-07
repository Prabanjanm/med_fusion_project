from sqlalchemy import Column, Integer, String, DateTime
from supabase_auth import datetime
from app.db.base import Base

class ClinicFeedback(Base):
    __tablename__ = "clinic_feedback"

    id = Column(Integer, primary_key=True)
    clinic_id = Column(Integer, nullable=False)
    message = Column(String, nullable=False)
    rating = Column(Integer)  # 1–5
    created_at = Column(DateTime, default=datetime.utcnow)
