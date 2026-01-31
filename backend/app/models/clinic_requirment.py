
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base



class ClinicRequirement(Base):
    __tablename__ = "clinic_requirements"

    id = Column(Integer, primary_key=True)

    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)

    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    purpose = Column(String, nullable=False)
    priority = Column(Integer, nullable=False) 
    status = Column(String, default="PENDING") 

    created_at = Column(DateTime(timezone=True), server_default=func.now())
