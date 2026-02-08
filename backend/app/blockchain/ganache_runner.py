import subprocess
import time
import socket
import shutil


GANACHE_PORTS = [7545, 8545]


def is_port_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0


def detect_ganache_url():
    for port in GANACHE_PORTS:
        if is_port_open(port):
            return f"http://127.0.0.1:{port}"
    return None


def start_ganache():
    existing = detect_ganache_url()
    if existing:
        print(f"✅ Ganache already running at {existing}")
        return existing

    ganache_cmd = shutil.which("ganache")
    if not ganache_cmd:
        print("⚠️ Ganache not installed")
        return None

    print("🚀 Starting Ganache...")
    subprocess.Popen(
        [ganache_cmd, "--deterministic", "--accounts", "10"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    time.sleep(3)
    return detect_ganache_url()
