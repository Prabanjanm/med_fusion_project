from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class ClinicInvitation(Base):
    __tablename__ = "clinic_invitations"

    id = Column(Integer, primary_key=True)
    reference_id = Column(String, unique=True, nullable=False)

    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)
    clinic_email = Column(String, nullable=False)

    token = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    accepted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
