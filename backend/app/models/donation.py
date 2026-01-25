from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True)
    item_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String, default="CREATED")
    company_id = Column(Integer, ForeignKey("companies.id"))
