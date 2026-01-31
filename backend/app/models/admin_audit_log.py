from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True)

    admin_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    action = Column(String, nullable=False)
    # VERIFY_COMPANY, REJECT_COMPANY, VERIFY_NGO, REJECT_NGO

    entity_type = Column(String, nullable=False)
    # COMPANY / NGO

    entity_id = Column(Integer, nullable=False)

    remarks = Column(String, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )