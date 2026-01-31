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

    EMAIL_FROM_NAME: str
    EMAIL_FROM_ADDRESS: str
    FRONTEND_URL: str
    GANACHE_URL: str = "http://127.0.0.1:7545"
    CONTRACT_ADDRESS: str = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
    @property
    def CHECKSUM_CONTRACT_ADDRESS(self) -> str:
        return Web3.to_checksum_address(self.CONTRACT_ADDRESS)


    class Config:
        env_file = ".env"


settings = Settings()
