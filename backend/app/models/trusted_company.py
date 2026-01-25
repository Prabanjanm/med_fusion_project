from sqlalchemy import Column, Integer, String
from app.db.base import Base


class TrustedCompany(Base):
    """
    Pre-verified company registry.
    Used to validate CIN & PAN during onboarding.
    """
    __tablename__ = "trusted_companies"

    id = Column(Integer, primary_key=True)
    company_name = Column(String, nullable=False)
    cin = Column(String, unique=True, nullable=False)
    pan = Column(String, nullable=False)
