# import json
# from web3 import Web3
# from solcx import compile_standard, install_solc

# GANACHE_URL = "http://127.0.0.1:7545"
# CONTRACT_PATH = "contracts/AuditLogs.sol"
# ABI_OUTPUT = "contracts/AuditLogs.json"


# def deploy():
#     install_solc("0.8.0")

#     with open(CONTRACT_PATH, "r") as f:
#         source = f.read()

#     compiled = compile_standard(
#         {
#             "language": "Solidity",
#             "sources": {
#                 "AuditLogs.sol": {"content": source}
#             },
#             "settings": {
#                 "outputSelection": {
#                     "*": {
#                         "*": ["abi", "evm.bytecode"]
#                     }
#                 }
#             },
#         },
#         solc_version="0.8.0",
#     )

#     abi = compiled["contracts"]["AuditLogs.sol"]["AuditLogs"]["abi"]
#     bytecode = compiled["contracts"]["AuditLogs.sol"]["AuditLogs"]["evm"]["bytecode"]["object"]

#     with open(ABI_OUTPUT, "w") as f:
#         json.dump({"abi": abi}, f, indent=2)

#     w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
#     assert w3.is_connected(), "Ganache not running"

#     account = w3.eth.accounts[0]
#     Contract = w3.eth.contract(abi=abi, bytecode=bytecode)

#     tx = Contract.constructor().transact({
#         "from": account,
#         "gas": 3_000_000
#     })

#     receipt = w3.eth.wait_for_transaction_receipt(tx)
#     print("✅ Contract deployed")
#     print("📍 Address:", receipt.contractAddress)


# if __name__ == "__main__":
#     deploy()
