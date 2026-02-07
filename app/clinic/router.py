# app/clinic/router.py
from fastapi import APIRouter, Depends, HTTPException
from app.db.deps import get_db
from app.core.security import require_role
from app.clinic.service import confirm_receipt
from app.clinic.schema import ConfirmReceiptResponse, ConfirmRequirementsRequest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.donation_allocation import DonationAllocation   
from app.models.clinic_requirment import ClinicRequirement
from app.services.storage_service import get_signed_file_url
from app.models.ocr_extracted_data import OCRExtractedData
from app.models.clinic_feedback import ClinicFeedback
from med_fusion_project.backend.app.blockchain.audit_chain import write_to_blockchain

router = APIRouter(prefix="/clinic", tags=["Clinic"])


@router.get("/allocations/pending")
async def get_pending_allocations(
    user=Depends(require_role("CLINIC")),
    db: AsyncSession = Depends(get_db)
):
    clinic_id = user["clinic_id"]

    result = await db.execute(
        select(DonationAllocation)
        .join(ClinicRequirement, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .where(ClinicRequirement.clinic_id == clinic_id)
        .where(DonationAllocation.received == False)
    )

    return result.scalars().all()


@router.post(
    "/allocations/{allocation_id}/confirm",
    response_model=ConfirmReceiptResponse
)
async def confirm_allocation_receipt(
    allocation_id: int,
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await confirm_receipt(db, clinic_user, allocation_id)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.clinic.service import get_clinic_allocation_history
from app.clinic.schema import ClinicAllocationHistory




@router.get(
    "/allocations",
    response_model=list[ClinicAllocationHistory]
)
async def clinic_allocations(
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await get_clinic_allocation_history(db, clinic_user)


from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.deps import get_db

from app.models.clinic_uploads import ClinicUpload
from app.models.ocr_extracted_data import OCRExtractedData

from app.services.storage_service import (
    upload_register_image,
    get_signed_file_url,
)

from app.services.ocr_service import (
    ocr_image,
    parse_assets,
)

from pdf2image import convert_from_bytes
from PIL import Image
import io

router = APIRouter(prefix="/clinic", tags=["Clinic"])


# =========================================================
# 1️⃣ UPLOAD REGISTER (OCR HAPPENS HERE – ONLY HERE)
# =========================================================
@router.post("/upload-register")
async def upload_register(
    clinic_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload clinic register (PDF / Image),
    run OCR once, store extracted data
    """

    # 1️⃣ Read file bytes
    file_bytes = await file.read()

    # 2️⃣ Upload to Supabase Storage
    storage_data = upload_register_image(
        clinic_id=clinic_id,
        file_bytes=file_bytes,
        filename=file.filename,
    )

    # 3️⃣ Save upload record
    upload = ClinicUpload(
        clinic_id=clinic_id,
        bucket_name=storage_data["bucket"],
        file_path=storage_data["path"],
    )
    db.add(upload)
    await db.flush()  # get upload.id

    # 4️⃣ Convert file → PIL Image
    if file.filename.lower().endswith(".pdf"):
        images = convert_from_bytes(file_bytes)
        image = images[0]  # MVP: first page
    else:
        image = Image.open(io.BytesIO(file_bytes))

    # 5️⃣ OCR (DEBUG ENABLED)
    extracted_text = ocr_image(image)

    print("===== OCR RAW TEXT START =====")
    print(extracted_text)
    print("===== OCR RAW TEXT END =====")

    # 6️⃣ Parse OCR text
    assets = parse_assets(extracted_text)
    print("PARSED ASSETS:", assets)

    # 7️⃣ Save extracted data
    for item in assets:
        db.add(
            OCRExtractedData(
                upload_id=upload.id,
                asset_name=item["asset_name"],
                quantity=item["quantity"],
                confidence=item["confidence"],
            )
        )

    await db.commit()

    return {
        "message": "Register uploaded and processed successfully",
        "upload_id": upload.id,
        "extracted_data": assets,
    }


# =========================================================
# 2️⃣ REVIEW UPLOAD (READ-ONLY, NO OCR HERE)
# =========================================================
@router.get("/uploads/{upload_id}/review")
async def review_upload(
    upload_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    View OCR extracted data + signed file URL
    Used by Clinic & NGO (verification)
    """

    # 1️⃣ Fetch upload
    result = await db.execute(
        select(ClinicUpload).where(ClinicUpload.id == upload_id)
    )
    upload = result.scalar_one_or_none()

    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")

    # 2️⃣ Fetch extracted OCR data
    result = await db.execute(
        select(OCRExtractedData).where(
            OCRExtractedData.upload_id == upload.id
        )
    )
    ocr_rows = result.scalars().all()

    # 3️⃣ Generate signed URL
    signed_url = get_signed_file_url(
        upload.bucket_name,
        upload.file_path,
    )

    # 4️⃣ Return response
    return {
        "upload_id": upload.id,
        "clinic_id": upload.clinic_id,
        "signed_file_url": signed_url,
        "extracted_data": [
            {
                "asset_name": row.asset_name,
                "quantity": row.quantity,
                "confidence": row.confidence,
            }
            for row in ocr_rows
        ],
    }


from app.services.ai_service import generate_requirements_from_upload
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

    response_data = []

    for row in rows:
        suggested_qty = int(row.quantity * BUFFER)

        req = ClinicRequirements(
            clinic_id=clinic_id,
            asset_name=row.asset_name,
            suggested_quantity=suggested_qty,
            source_upload_id=upload_id,
            status="DRAFT",
        )
        db.add(req)

        response_data.append({
            "asset_name": row.asset_name,
            "last_used": row.quantity,
            "suggested_quantity": suggested_qty,
            "buffer_applied": "25%",
            "status": "DRAFT",
        })

    await db.commit()

    return response_data


@router.post("/requirements/generate")
async def generate_requirements(
    clinic_id: int,
    upload_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    AI generates requirement draft from OCR data
    """

    requirements = await generate_requirements_from_upload(
        db=db,
        clinic_id=clinic_id,
        upload_id=upload_id,
    )

    return {
        "clinic_id": clinic_id,
        "upload_id": upload_id,
        "ai_logic": "Based on recent consumption with 25% safety buffer",
        "total_items": len(requirements),
        "requirements": requirements,
    }



@router.post("/requirements/{requirement_id}/confirm")
async def confirm_single_requirement(
    requirement_id: int,
    confirmed_quantity: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Clinic confirms a single AI-generated requirement
    """

    result = await db.execute(
        select(ClinicRequirements).where(
            ClinicRequirements.id == requirement_id
        )
    )
    requirement = result.scalar_one_or_none()

    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    if requirement.status == "CONFIRMED":
        raise HTTPException(
            status_code=400,
            detail="Requirement already confirmed",
        )

    requirement.confirmed_quantity = confirmed_quantity
    requirement.status = "CONFIRMED"

    await db.commit()

    return {
        "message": "Requirement confirmed successfully",
        "requirement_id": requirement.id,
        "asset_name": requirement.asset_name,
        "confirmed_quantity": confirmed_quantity,
        "status": requirement.status,
    }


from datetime import date
from app.services.ai_service import generate_weekly_requirements


@router.post("/requirements/generate-weekly")
async def generate_weekly_requirement(
    clinic_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    AI generates week-wise requirement draft
    """

    requirements = await generate_weekly_requirements(
        db=db,
        clinic_id=clinic_id,
        reference_date=date.today(),
    )

    if not requirements:
        return {
            "clinic_id": clinic_id,
            "message": "No usage data found for this week",
            "requirements": [],
        }

    return {
        "clinic_id": clinic_id,
        "week": "Current Week",
        "ai_logic": "Aggregated weekly consumption with 25% safety buffer",
        "total_items": len(requirements),
        "requirements": requirements,
    }


@router.post("/requirements/confirm-all")
async def confirm_all_requirements(
    clinic_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Clinic confirms all DRAFT requirements at once
    """

    result = await db.execute(
        select(ClinicRequirements).where(
            ClinicRequirements.clinic_id == clinic_id,
            ClinicRequirements.status == "DRAFT",
        )
    )
    requirements = result.scalars().all()

    if not requirements:
        return {
            "message": "No draft requirements to confirm",
            "confirmed_count": 0,
        }

    for req in requirements:
        # If clinic didn't edit, accept AI suggestion
        req.confirmed_quantity = (
            req.confirmed_quantity
            if req.confirmed_quantity
            else req.suggested_quantity
        )
        req.status = "CONFIRMED"

    await db.commit()

    return {
        "message": "All requirements confirmed successfully",
        "confirmed_count": len(requirements),
    }

from collections import defaultdict
from sqlalchemy import select


@router.get("/requirements/draft")
async def get_draft_requirements(
    clinic_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicRequirements).where(
            ClinicRequirements.clinic_id == clinic_id,
            ClinicRequirements.status == "DRAFT",
        )
    )
    requirements = result.scalars().all()

    grouped = defaultdict(lambda: {
        "asset_name": None,
        "requirement_ids": [],
        "suggested_quantity": 0,
        "editable_quantity": 0,
        "unit": "units",
        "status": "DRAFT",
    })

    for r in requirements:
        key = r.asset_name.lower()

        grouped[key]["asset_name"] = r.asset_name
        grouped[key]["requirement_ids"].append(r.id)
        grouped[key]["suggested_quantity"] += r.suggested_quantity

    # finalize editable_quantity
    response_items = []
    for item in grouped.values():
        item["editable_quantity"] = item["suggested_quantity"]
        response_items.append(item)

    return {
        "clinic_id": clinic_id,
        "requirements": response_items,
    }

@router.post("/requirements/confirm")
async def confirm_requirements(
    data: ConfirmRequirementsRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Confirm AI-generated requirements (grouped by asset)
    """

    # 🔽 THIS IS WHERE YOUR CODE GOES 🔽
    for item in data.confirmed_items:
        for req_id in item.requirement_ids:
            result = await db.execute(
                select(ClinicRequirements).where(
                    ClinicRequirements.id == req_id,
                    ClinicRequirements.clinic_id == data.clinic_id,
                    ClinicRequirements.status == "DRAFT",
                )
            )
            req = result.scalar_one_or_none()

            if req:
                req.confirmed_quantity = item.final_quantity
                req.status = "CONFIRMED"
            req.confirmed_quantity = item.final_quantity
            req.status = "CONFIRMED"

            # emergency rule
            if item.final_quantity >= 100:
                req.priority = "EMERGENCY"
            else:
                req.priority = "NORMAL"
    

    audit = write_to_blockchain(
     action="REQUIREMENT_CONFIRMED",
     payload={
        "clinic_id": data.clinic_id,
        "confirmed_items": data.confirmed_items,
    }
)

    req.blockchain_tx = audit["tx_hash"]
    req.blockchain_hash = audit["record_hash"]

    await db.commit()

    return {
        "message": "Requirements confirmed successfully",
        "confirmed_assets": len(data.confirmed_items),
        "status": "CONFIRMED",
    }


@router.get("/dashboard")
async def clinic_dashboard(
    clinic_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicRequirements).where(
            ClinicRequirements.clinic_id == clinic_id
        )
    )
    rows = result.scalars().all()

    total = len(rows)
    confirmed = len([r for r in rows if r.status == "CONFIRMED"])
    allocated = len([r for r in rows if r.status == "ALLOCATED"])
    emergency = len([r for r in rows if r.priority == "EMERGENCY"])

    return {
        "clinic_id": clinic_id,
        "kpis": {
            "total_requirements": total,
            "confirmed": confirmed,
            "allocated": allocated,
            "emergency_cases": emergency,
        }
    }


@router.post("/feedback")
async def submit_feedback(
    clinic_id: int,
    message: str,
    rating: int,
    db: AsyncSession = Depends(get_db),
):
    feedback = ClinicFeedback(
        clinic_id=clinic_id,
        message=message,
        rating=rating,
    )
    db.add(feedback)
    await db.commit()

    return {"message": "Feedback submitted successfully"}
