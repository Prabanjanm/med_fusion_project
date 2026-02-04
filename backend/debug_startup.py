print("Importing config...")
from app.core.config import settings
print("Config OK")

print("Importing blockchain...")
from app.blockchain.service import w3, contract
print("Blockchain OK")

print("Importing DB...")
from app.db.database import engine
print("DB OK")

print("Importing main App...")
from app.main import app
print("App OK")
