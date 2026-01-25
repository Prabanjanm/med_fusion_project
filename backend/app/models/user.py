from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)

    password_hash = Column(String, nullable=True)  # initially NULL
    password_set = Column(Boolean, default=False)

    role = Column(String, default="CSR")
    company_id = Column(Integer, ForeignKey("companies.id"))
