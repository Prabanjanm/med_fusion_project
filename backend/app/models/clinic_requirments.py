from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base


class ClinicRequirements(Base):
    __tablename__ = "clinic_requirement"

    id = Column(Integer, primary_key=True)
    clinic_id = Column(Integer, nullable=False)
    asset_name = Column(String, nullable=False)

    suggested_quantity = Column(Integer, nullable=False)
    confirmed_quantity = Column(Integer, nullable=True)
    priority = Column(String, default="NORMAL")
    status = Column(String, default="DRAFT")
    source_upload_id = Column(Integer, ForeignKey("clinic_uploads.id"))
    blockchain_tx = Column(String, nullable=True)
    blockchain_hash = Column(String, nullable=True)


    created_at = Column(DateTime, default=datetime.utcnow)
