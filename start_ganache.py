import subprocess
import os
import sys

def start():
    print("Checking for ganache...")
    try:
        # Try to run ganache --version
        subprocess.run(["npx", "ganache", "--version"], check=True, shell=True)
        print("Starting ganache on port 7545...")
        # Start ganache in background
        proc = subprocess.Popen(
            ["npx", "ganache", "--port", "7545", "--deterministic"],
            stdout=open("ganache_out.log", "w"),
            stderr=open("ganache_err.log", "w"),
            shell=True
        )
        print(f"Ganache started with PID {proc.pid}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    start()
