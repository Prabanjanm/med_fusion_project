from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base


class TrustedNGO(Base):
    __tablename__ = "trusted_ngos"

    id = Column(Integer, primary_key=True)
    ngo_name = Column(String, nullable=False)
    csr_1_number = Column(String, unique=True, nullable=False)
    has_80g = Column(Boolean, nullable=False)
    official_email = Column(String, nullable=False)
