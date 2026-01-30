from pydantic import BaseModel



class SetPasswordRequest(BaseModel):
    token: str
    password: str
