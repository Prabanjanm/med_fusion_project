# import json
# import hashlib
# from web3 import Web3
# from app.core.config import settings

# w3 = Web3(Web3.HTTPProvider(settings.GANACHE_URL))
# BLOCKCHAIN_ENABLED = w3.is_connected()

# contract = None

# if BLOCKCHAIN_ENABLED:
#     with open("contracts/AuditLogs.json", "r") as f:
#         contract_data = json.load(f)

#     abi = contract_data["abi"]

#     contract = w3.eth.contract(
#         address=settings.AUDIT_CONTRACT_ADDRESS,
#         abi=abi,
#     )


# def generate_hash(payload: dict) -> str:
#     return hashlib.sha256(
#         json.dumps(payload, sort_keys=True).encode()
#     ).hexdigest()


# def log_to_blockchain(action: str, payload: dict):
#     record_hash = generate_hash(payload)

#     if not BLOCKCHAIN_ENABLED or contract is None:
#         return {
#             "record_hash": record_hash,
#             "tx_hash": None,
#             "block_number": None,
#         }

#     tx = contract.functions.logAction(
#         action,
#         record_hash
#     ).transact({
#         "from": w3.eth.accounts[0],
#         "gas": 3_000_000,
#     })

#     receipt = w3.eth.wait_for_transaction_receipt(tx)

#     return {
#         "record_hash": record_hash,
#         "tx_hash": receipt.transactionHash.hex(),
#         "block_number": receipt.blockNumber,
#     }

from app.core.config import settings

def log_to_blockchain(action: str, payload: dict):
    """
    Blockchain disabled stub.
    Keeps interface intact without executing blockchain code.
    """
    if not settings.BLOCKCHAIN_ENABLED:
        return {
            "record_hash": None,
            "tx_hash": None,
            "block_number": None,
        }
