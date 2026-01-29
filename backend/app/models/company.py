from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    company_name = Column(String, nullable=False)
    cin = Column(String, unique=True, nullable=False)
    pan = Column(String, nullable=False)

    is_verified = Column(Boolean, default=False)
