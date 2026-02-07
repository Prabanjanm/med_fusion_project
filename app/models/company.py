from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    csr_uid = Column(String, unique=True, index=True)
    company_name = Column(String, nullable=False)
    cin = Column(String, unique=True, nullable=False)
    pan = Column(String, nullable=False)
    csr_policy_doc = Column(String, nullable=False)     # file path / url
    board_resolution_doc = Column(String, nullable=False)
    official_email = Column(String, unique=True, nullable=False)
    is_verified = Column(Boolean, default=False)
