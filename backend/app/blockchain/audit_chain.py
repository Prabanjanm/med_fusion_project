import json
import hashlib
from web3 import Web3
from app.core.config import settings

w3 = Web3(Web3.HTTPProvider(settings.GANACHE_URL))

contract = w3.eth.contract(
    address=settings.AUDIT_CONTRACT_ADDRESS,
    # abi=settings.AUDIT_CONTRACT_ABI,
)

def generate_hash(data: dict) -> str:
    payload = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(payload).hexdigest()


def write_to_blockchain(action: str, payload: dict):
    record_hash = generate_hash(payload)

    tx = contract.functions.logAction(
        action,
        record_hash
    ).transact({
        "from": w3.eth.accounts[0],
        "gas": 3000000,
    })

    receipt = w3.eth.wait_for_transaction_receipt(tx)

    return {
        "record_hash": record_hash,
        "tx_hash": receipt.transactionHash.hex(),
        "block_number": receipt.blockNumber,
    }
