from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base
from sqlalchemy import ForeignKey


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True)
    clinic_uid = Column(String, unique=True, index=True)

    clinic_name = Column(String, nullable=False)

    facility_id = Column(String, nullable=False)
    facility_id_type = Column(String, nullable=False)  # ABHA / CEA

    doctor_registration_number = Column(String, nullable=True)

    pincode = Column(String, nullable=False)

    official_email = Column(String, unique=True, nullable=False)

    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=False)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())




