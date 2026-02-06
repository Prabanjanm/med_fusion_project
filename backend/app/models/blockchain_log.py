from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base import Base

class BlockchainLog(Base):
    __tablename__ = "blockchain_logs"

    id = Column(Integer, primary_key=True)
    tx_hash = Column(String, unique=True, nullable=False)
    action = Column(String, nullable=False)
    reference_id = Column(String, nullable=True)
    role = Column(String, nullable=True)
    entity_name = Column(String, nullable=True)
    payload = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="RECORDED") # RECORDED, ON_CHAIN, FAILED
