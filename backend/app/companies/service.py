from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.company import Company
from app.models.user import User
from app.models.trusted_company import TrustedCompany
from app.core.id_generator import generate_uid
from fastapi import HTTPException,UploadFile
from app.services.storage_service import upload_org_document



async def register_company(
    db: AsyncSession,
    company_name: str,
    cin: str,
    pan: str,
    official_email: str,
    csr_policy_doc: UploadFile,
    board_resolution_doc: UploadFile,
):
    """
    Register a CSR company with document upload.
    Company is verified only after admin approval.
    """

    # 1️⃣ Verify company in trusted registry
    trusted = await db.execute(
        select(TrustedCompany).where(
            TrustedCompany.cin == cin,
            TrustedCompany.pan == pan,
        )
    )

    if not trusted.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Company not found in trusted registry",
        )

    # 2️⃣ Check if company already exists
    existing = await db.execute(
        select(Company).where(Company.cin == cin)
    )
    company = existing.scalar_one_or_none()

    if company:
        return {
            "message": "Company already registered",
            "csr_uid": company.csr_uid,
            "next_step": "Please login or wait for admin verification",
        }

    # 3️⃣ Read uploaded files
    try:
        csr_policy_bytes = await csr_policy_doc.read()
        board_resolution_bytes = await board_resolution_doc.read()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to read uploaded files",
        )

    # 4️⃣ Upload documents to storage bucket
    csr_policy_path = upload_org_document(
        file_bytes=csr_policy_bytes,
        filename=csr_policy_doc.filename,
        folder="csr_policy",
    )

    board_resolution_path = upload_org_document(
        file_bytes=board_resolution_bytes,
        filename=board_resolution_doc.filename,
        folder="board_resolution",
    )

    # 5️⃣ Create company record (unverified)
    company = Company(
        csr_uid=generate_uid("CSR"),
        company_name=company_name,
        cin=cin,
        pan=pan,
        official_email=official_email,
        csr_policy_doc=csr_policy_path,
        board_resolution_doc=board_resolution_path,
        is_verified=False,
    )

    db.add(company)
    await db.commit()
    await db.refresh(company)

    # 6️⃣ Create user stub (password set later)
    existing_user = await db.execute(
        select(User).where(User.email == official_email)
    )

    if not existing_user.scalar_one_or_none():
        user = User(
            email=official_email,
            role="CSR",
            company_id=company.id,
            password_set=False,
        )
        db.add(user)
        await db.commit()

    return {
        "message": "Company registered successfully",
        "csr_uid": company.csr_uid,
        "next_step": "Admin will verify documents. Password setup link will be emailed after approval.",
    }