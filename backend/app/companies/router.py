from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.companies.schema import CompanyRegister
from app.companies.service import register_company

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("/register")
async def register_company_endpoint(
    data: CompanyRegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await register_company(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
