import json
from web3 import Web3
from app.core.config import settings

w3 = Web3(Web3.HTTPProvider(settings.GANACHE_URL))
CONTRACT_ACCOUNT =Web3.to_checksum_address(settings.CHECKSUM_CONTRACT_ADDRESS)

with open("app/blockchain/contract.json") as f:
    contract_data = json.load(f)
contract = w3.eth.contract(
    address=Web3.to_checksum_address(settings.CHECKSUM_CONTRACT_ADDRESS),
    abi=contract_data["abi"]
)

# def log_to_blockchain(action: str, entity: str):
#     tx = contract.functions.logAction(action, entity).transact({
#         "from": w3.eth.accounts[0]
#     })
#     w3.eth.wait_for_transaction_receipt(tx)

def log_to_blockchain(action: str, entity: str) -> dict:
    nonce = w3.eth.get_transaction_count(CONTRACT_ACCOUNT)

    tx = contract.functions.logAction(
        action,
        entity
    ).build_transaction({
        "from": CONTRACT_ACCOUNT,
        "nonce": nonce,
        "gas": 200000,
        "gasPrice": w3.to_wei("2", "gwei")
    })

    # Ganache auto-unlocked account
    tx_hash = w3.eth.send_transaction(tx)

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "tx_hash": tx_hash.hex(),
        "block_number": receipt.blockNumber,
        "status": "SUCCESS" if receipt.status == 1 else "FAILED"
    }

