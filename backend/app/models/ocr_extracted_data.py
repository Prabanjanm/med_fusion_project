from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base


class OCRExtractedData(Base):
    __tablename__ = "ocr_extracted_data"

    id = Column(Integer, primary_key=True, index=True)

    upload_id = Column(
        Integer,
        ForeignKey("clinic_uploads.id"),
        nullable=False,
        index=True,
    )

    asset_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    confidence = Column(Float, nullable=False)

    extracted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
