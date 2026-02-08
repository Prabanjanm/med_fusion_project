from pydantic_settings import BaseSettings
from web3 import Web3



class Settings(BaseSettings):
    """
    Application configuration settings.
    """

    DATABASE_URL: str
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BREVO_SMTP_SERVER: str
    BREVO_SMTP_PORT: int
    BREVO_SMTP_LOGIN: str
    BREVO_SMTP_KEY: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_URL: str
    EMAIL_FROM_NAME: str
    EMAIL_FROM_ADDRESS: str
    FRONTEND_URL: str
    EMAIL_TIMEOUT: int = 600  # seconds
    BLOCKCHAIN_ENABLED: bool = False
    GANACHE_URL: str | None = None
    AUDIT_CONTRACT_ADDRESS: str | None = None
    @property
    def CHECKSUM_AUDIT_CONTRACT_ADDRESS(self) -> str:
        return Web3.to_checksum_address(self.AUDIT_CONTRACT_ADDRESS)


    class Config:
        env_file = ".env"


settings = Settings()
