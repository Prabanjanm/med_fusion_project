from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from datetime import datetime
from app.db.base import Base


class DonationAllocations(Base):
    __tablename__ = "donation_allocation"

    id = Column(Integer, primary_key=True)
    donation_id = Column(Integer, nullable=False)

    clinic_requirement_id = Column(
        Integer,
        ForeignKey("clinic_requirement.id"),
        nullable=False,
    )

    allocated_quantity = Column(Integer, nullable=False)
    blockchain_tx = Column(String, nullable=True)
    blockchain_hash = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
