import subprocess
import time
import socket

GANACHE_PORT = 7545

def is_ganache_running():
    try:
        s = socket.create_connection(("127.0.0.1", GANACHE_PORT), timeout=2)
        s.close()
        return True
    except:
        return False

def start_ganache():
    if is_ganache_running():
        print("✅ Ganache already running")
        return

    print("🚀 Starting Ganache...")
    subprocess.Popen(
        ["ganache", "--port", "7545", "--deterministic"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(3)
    print("✅ Ganache started")
