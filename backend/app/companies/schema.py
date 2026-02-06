from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):
    company_name: str
    cin: str
    pan: str
    official_email: EmailStr
    password: str | None = None  # Optional: if provided, sets password immediately
