from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True)
    ngo_name = Column(String, nullable=False)
    csr_1_number = Column(String, unique=True, nullable=False)
    has_80g = Column(Boolean, nullable=False)
    official_email = Column(String, nullable=False)

    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
