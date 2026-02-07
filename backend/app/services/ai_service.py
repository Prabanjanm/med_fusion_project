from sqlalchemy import select
from app.models.ocr_extracted_data import OCRExtractedData
from app.models.clinic_requirments import ClinicRequirements


async def generate_requirements_from_upload(
    db,
    clinic_id: int,
    upload_id: int,
):
    BUFFER = 1.25

    result = await db.execute(
        select(OCRExtractedData).where(
            OCRExtractedData.upload_id == upload_id
        )
    )
    rows = result.scalars().all()

    requirements = []

    for row in rows:
        suggested_qty = int(row.quantity * BUFFER)

        req = ClinicRequirements(
            clinic_id=clinic_id,
            asset_name=row.asset_name,
            suggested_quantity=suggested_qty,
            source_upload_id=upload_id,
        )
        db.add(req)
        requirements.append(req)

    await db.commit()
    return requirements


from sqlalchemy import select, func
from datetime import date, timedelta
from app.models.clinic_uploads import ClinicUpload
from app.models.ocr_extracted_data import OCRExtractedData
from app.models.clinic_requirments import ClinicRequirements
from app.blockchain.audit_chain import write_to_blockchain



def get_week_range(reference_date: date):
    """
    Returns Monday–Sunday range for given date
    """
    start = reference_date - timedelta(days=reference_date.weekday())
    end = start + timedelta(days=6)
    return start, end


async def generate_weekly_requirements(
    db,
    clinic_id: int,
    reference_date: date = None,
):
    """
    Generate AI-based weekly requirements
    """
    if not reference_date:
        reference_date = date.today()

    week_start, week_end = get_week_range(reference_date)

    BUFFER = 1.25

    # 1️⃣ Get all uploads for the week
    uploads_result = await db.execute(
        select(ClinicUpload.id).where(
            ClinicUpload.clinic_id == clinic_id,
            ClinicUpload.uploaded_at >= week_start,
            ClinicUpload.uploaded_at <= week_end,
        )
    )
    upload_ids = [row[0] for row in uploads_result.all()]

    if not upload_ids:
        return []

    # 2️⃣ Aggregate usage per asset
    usage_result = await db.execute(
        select(
            OCRExtractedData.asset_name,
            func.sum(OCRExtractedData.quantity).label("total_used"),
        ).where(
            OCRExtractedData.upload_id.in_(upload_ids)
        ).group_by(
            OCRExtractedData.asset_name
        )
    )

    usage_data = usage_result.all()
    response = []

    # 3️⃣ Generate weekly requirements
    for asset_name, total_used in usage_data:
        suggested_qty = int(total_used * BUFFER)

        req = ClinicRequirements(
            clinic_id=clinic_id,
            asset_name=asset_name,
            suggested_quantity=suggested_qty,
            status="DRAFT",
        )
        db.add(req)
        audit = write_to_blockchain(
        action="REQUIREMENT_CREATED",
        payload={
            "clinic_id": clinic_id,
            "asset": asset_name,
            "suggested_quantity": suggested_qty,
        }
    )

        req.blockchain_tx = audit["tx_hash"]
        req.blockchain_hash = audit["record_hash"]

        response.append({
            "asset_name": asset_name,
            "total_used_this_week": total_used,
            "suggested_quantity": suggested_qty,
            "buffer_applied": "25%",
            "status": "DRAFT",
        })

    await db.commit()
    return response
