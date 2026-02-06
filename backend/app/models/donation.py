from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=True)


    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    purpose = Column(String, nullable=False)

    board_resolution_ref = Column(String, nullable=False)
    csr_policy_declared = Column(Boolean, nullable=False)
    expiry_date = Column(DateTime(timezone=True), nullable=True)

    status = Column(String, nullable=False, default="AUTHORIZED")

    authorized_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
