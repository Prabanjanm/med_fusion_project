from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base


class ClinicUpload(Base):
    __tablename__ = "clinic_uploads"

    id = Column(Integer, primary_key=True, index=True)

    clinic_id = Column(
        Integer,
        ForeignKey("clinics.id"),
        nullable=False,
        index=True,
    )

    bucket_name = Column(
        String,
        nullable=False,
        comment="Supabase bucket name",
    )

    file_path = Column(
        String,
        nullable=False,
        comment="Path inside Supabase bucket",
    )

    uploaded_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
