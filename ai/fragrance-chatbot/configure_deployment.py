"""Create the VM's private .env without printing the service key."""

import argparse
import ipaddress
import os
from pathlib import Path
import re
import secrets

ROOT = Path(__file__).resolve().parent


def hostname_for(public_ip: str, custom_host: str | None = None):
    address = ipaddress.IPv4Address(public_ip)
    if not address.is_global:
        raise ValueError("Use the VM's public IPv4 address, not a private or example address.")
    host = custom_host or f"fragrance-chat.{str(address).replace('.', '-')}.sslip.io"
    labels = host.split(".")
    if len(host) > 253 or len(labels) < 2 or any(
        not re.fullmatch(r"[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?", label)
        for label in labels
    ):
        raise ValueError("Enter a hostname without a scheme, path, or port.")
    return host.lower()


def write_configuration(public_ip: str, output: Path, custom_host: str | None = None):
    host = hostname_for(public_ip, custom_host)
    # Exclusive creation preserves a working key when someone reruns setup.
    descriptor = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as file:
        file.write(f"AI_HOST={host}\nCHATBOT_SERVICE_KEY={secrets.token_hex(32)}\n")
    return host


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ip", required=True, help="Public IPv4 assigned to your Oracle VM")
    parser.add_argument("--host", help="Optional custom DNS hostname; default uses sslip.io")
    parser.add_argument("--output", type=Path, default=ROOT / ".env")
    args = parser.parse_args()
    try:
        host = write_configuration(args.ip, args.output, args.host)
    except (ValueError, OSError) as error:
        parser.exit(1, f"Configuration was not written: {error}\n")
    print(f"Created {args.output}. Model URL: https://{host}/")
    print("Copy CHATBOT_SERVICE_KEY directly from this private file into Render's environment settings.")
