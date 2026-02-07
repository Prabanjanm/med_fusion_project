from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.company import Company
from app.models.user import User
from app.models.trusted_company import TrustedCompany
from app.core.id_generator import generate_uid
from fastapi import HTTPException
from app.services.storage_service import upload_org_document



async def register_company(db: AsyncSession, data):
    """
    Register CSR company with documents stored in bucket
    """

    # 1️⃣ Trusted registry check
    trusted = await db.execute(
        select(TrustedCompany).where(
            TrustedCompany.cin == data.cin,
            TrustedCompany.pan == data.pan
        )
    )
    if not trusted.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Company not found in trusted registry")

    # 2️⃣ Existing company check
    existing_company = await db.execute(
        select(Company).where(Company.cin == data.cin)
    )
    company = existing_company.scalar_one_or_none()

    if company:
        return {
            "message": "Company already registered",
            "csr_uid": company.csr_uid,
            "next_step": "Please login or wait for admin verification",
        }

    csr_uid = generate_uid("CSR")

    # 3️⃣ Upload documents
    csr_policy = upload_org_document(
        entity="csr",
        entity_uid=csr_uid,
        file_bytes=await data.csr_policy_doc.read(),
        filename=data.csr_policy_doc.filename,
        content_type=data.csr_policy_doc.content_type,
    )

    board_resolution = upload_org_document(
        entity="csr",
        entity_uid=csr_uid,
        file_bytes=await data.board_resolution_doc.read(),
        filename=data.board_resolution_doc.filename,
        content_type=data.board_resolution_doc.content_type,
    )

    # 4️⃣ Create company record
    company = Company(
        csr_uid=csr_uid,
        company_name=data.company_name,
        cin=data.cin,
        pan=data.pan,
        official_email=data.official_email,
        csr_policy_doc=csr_policy["path"],
        board_resolution_doc=board_resolution["path"],
        is_verified=False,
    )

    db.add(company)
    await db.commit()
    await db.refresh(company)

    # 5️⃣ Create user placeholder
    existing_user = await db.execute(
        select(User).where(User.email == data.official_email)
    )
    if not existing_user.scalar_one_or_none():
        db.add(User(
            email=data.official_email,
            company_id=company.id,
            password_set=False,
        ))
        await db.commit()

    return {
        "message": "Company registered successfully",
        "csr_uid": csr_uid,
        "next_step": "Admin will verify documents. Password setup link will be emailed after approval.",
    }
