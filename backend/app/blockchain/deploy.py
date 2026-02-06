import json
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

assert w3.is_connected(), "❌ Ganache not running"

with open("app/blockchain/contract.json") as f:
    contract_data = json.load(f)

abi = contract_data["abi"]
bytecode = contract_data["bytecode"]

account = w3.eth.accounts[0]

Audit = w3.eth.contract(abi=abi, bytecode=bytecode)

tx_hash = Audit.constructor().transact({"from": account})
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

print("✅ Contract deployed")
print("📍 Address:", tx_receipt.contractAddress)
