from sqlalchemy import Boolean, Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from app.db.base import Base


class DonationAllocation(Base):
    __tablename__ = "donation_allocations"

    id = Column(Integer, primary_key=True)

    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    clinic_requirement_id = Column(Integer, ForeignKey("clinic_requirements.id"), nullable=False)

    allocated_at = Column(DateTime(timezone=True), server_default=func.now())

    # 🔐 Clinic confirmation
    received = Column(Boolean, default=False)
    received_at = Column(DateTime(timezone=True), nullable=True)