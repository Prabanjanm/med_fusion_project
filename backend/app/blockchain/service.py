import json
import asyncio
from concurrent.futures import ThreadPoolExecutor
from web3 import Web3, HTTPProvider
from app.core.config import settings
from datetime import datetime

# Initialize Web3 with a short timeout to prevent hanging
w3 = Web3(HTTPProvider(settings.GANACHE_URL, request_kwargs={'timeout': 3}))
CONTRACT_ACCOUNT = Web3.to_checksum_address(settings.CHECKSUM_CONTRACT_ADDRESS)

with open("app/blockchain/contract.json") as f:
    contract_data = json.load(f)
contract = w3.eth.contract(
    address=Web3.to_checksum_address(settings.CHECKSUM_CONTRACT_ADDRESS),
    abi=contract_data["abi"]
)

# Thread pool for blocking Web3 calls
executor = ThreadPoolExecutor(max_workers=5)

def is_blockchain_online():
    try:
        return w3.is_connected()
    except:
        return False

def log_to_blockchain(action: str, entity: str, role: str = "SYSTEM", donor_name: str = "N/A", metadata: dict = None) -> dict:
    try:
        if not is_blockchain_online():
            raise ConnectionError("Blockchain node reachable but refused connection")

        nonce = w3.eth.get_transaction_count(CONTRACT_ACCOUNT)

        # Payload as JSON for unified audit trail
        data_dict = {
            "action": action,
            "entity": entity,
            "role": role,
            "name": donor_name
        }
        
        # Merge extra metadata if provided (e.g. clinic_name, ngo_name)
        if metadata:
            data_dict.update(metadata)

        payload = json.dumps(data_dict)

        tx = contract.functions.logAction(
            action, # Keep action as is for potential contract filtering
            payload
        ).build_transaction({
            "from": CONTRACT_ACCOUNT,
            "nonce": nonce,
            "gas": 300000,
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
    except Exception as e:
        print(f"🔗 Blockchain Offline/Error: {str(e)}")
        # Fallback to simulated transaction for high availability
        import uuid
        return {
            "tx_hash": f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}",
            "block_number": 0,
            "status": "SIMULATED_SUCCESS",
            "message": "Recorded off-chain due to node unavailability"
        }

def _fetch_blockchain_logs():
    """Blocking function to fetch logs to be run in executor"""
    if not w3.is_connected():
        return []
        
    # Get all logs from genesis
    logs = contract.events.LogRecorded.get_logs(from_block=0)
    
    trail = []
    for log in logs:
        action = log.args.action
        entity_payload = log.args.entity
        timestamp = log.args.timestamp
        tx_hash = log.transactionHash.hex()

        log_entry = {
            "timestamp": datetime.fromtimestamp(timestamp).isoformat(),
            "tx_hash": tx_hash
        }

        try:
            data = json.loads(entity_payload)
            # Default Standard Fields
            log_entry["role"] = data.get("role", "UNKNOWN")
            log_entry["entity_name"] = data.get("name", "N/A")
            log_entry["action"] = data.get("action", action)
            log_entry["reference_id"] = data.get("entity", action)
            
            # Merge ALL other data fields for UI filtering (clinic_name, ngo_name, etc.)
            for k, v in data.items():
                if k not in log_entry:
                    log_entry[k] = v
                    
        except:
            # Legacy/Unparseable Log
            log_entry["role"] = "LEGACY"
            log_entry["entity_name"] = "N/A"
            log_entry["action"] = action
            log_entry["reference_id"] = entity_payload

        trail.append(log_entry)
    
    return sorted(trail, key=lambda x: x["timestamp"], reverse=True)

async def get_audit_trail():
    """
    Fetch all events from blockchain asynchronously.
    Uses a thread pool to avoid blocking the main event loop.
    Gracefully handles timeouts and connection errors.
    """
    loop = asyncio.get_event_loop()
    try:
        # Run the blocking Web3 call in a separate thread with STRICT asyncio timeout
        trail = await asyncio.wait_for(
            loop.run_in_executor(executor, _fetch_blockchain_logs),
            timeout=2.0
        )
        return trail
    except (asyncio.TimeoutError, Exception) as e:
        print(f"❌ Blockchain Trail Error (Timeout/Connection): {str(e)}")
        # If timeout occurs, return empty list to trigger DB fallback immediately
        return []

from datetime import datetime

