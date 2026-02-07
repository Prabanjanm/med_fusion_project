from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=True)
    password_set = Column(Boolean, default=False)
    role = Column(String, nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, unique=True)
    ngo_id = Column(Integer, ForeignKey("ngos.id"), nullable=True, unique=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True, unique=True)

    __table_args__ = (
        UniqueConstraint("company_id"),
        UniqueConstraint("ngo_id"),
        UniqueConstraint("clinic_id"),
    )
