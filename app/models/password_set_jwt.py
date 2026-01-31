from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class PasswordSetupToken(Base):
    __tablename__ = "password_setup_tokens"

    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False)

    used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
