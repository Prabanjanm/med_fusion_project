from pydantic import BaseModel, EmailStr


class CompanyRegister(BaseModel):
    company_name: str
    cin: str
    pan: str
    csr_policy_doc: str
    board_resolution_doc: str
    official_email: EmailStr
