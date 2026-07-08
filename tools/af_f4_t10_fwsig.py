#!/usr/bin/env python3
"""
af_f4_t10_fwsig.py — AF-F4 T10 firmware release integrity (signing + verification).

WHY THIS EXISTS
    ArduPilot's on-device bootloader already binds each firmware image to a
    board_id and verifies an image CRC32 before booting (see
    libraries/AP_CheckFirmware/AP_CheckFirmware.cpp). That stops corrupted or
    wrong-board images. It is NOT a cryptographic authenticity check: a CRC is
    unkeyed, and the STM32F405 bootloader sector is too small to host ArduPilot
    secure boot (AP_SIGNED_FIRMWARE / monocypher).

    The AF-F4 T10 project therefore adds its OWN integrity layer on the
    distribution / update path. Every firmware artifact published for AF-F4 T10
    is signed with the AF-F4 T10 Ed25519 release key. The AF-F4 T10 update tools
    (web updater + this CLI) verify that signature BEFORE flashing and REFUSE to
    flash any file that is tampered, corrupted, truncated, or not signed with the
    AF-F4 T10 key. No party without the AF-F4 T10 private key can produce a
    firmware file our tools will accept.

SCOPE (state this honestly to any auditor)
    This is host / update-tool-path cryptographic integrity. It guarantees the
    firmware delivered through the AF-F4 T10 updater is authentic and unmodified.
    It does not replace on-device secure boot (unavailable on F405); a bypass
    would require physical SWD access outside the AF-F4 T10 update flow, where the
    on-device board_id + CRC checks still apply.

CRYPTO
    Ed25519 (RFC 8032) via the `cryptography` library. The signature is computed
    over the RAW firmware file bytes. The file's SHA-256 is also recorded in the
    manifest for fast integrity display / logging (back-data).

USAGE
    af_f4_t10_fwsig.py keygen [--force]
    af_f4_t10_fwsig.py sign   <firmware.apj|.hex> [--out manifest.json]
    af_f4_t10_fwsig.py verify <firmware.apj|.hex> [--manifest m.json] [--pubkey k.pem]
"""
import argparse
import base64
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey, Ed25519PublicKey,
)

SCHEMA = "af-f4-t10-fw-integrity/1"
KEY_ID = "af-f4-t10-fw-ed25519-2026"
MANIFEST_EXT = ".aff4t10.json"
KEYDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "keys")
PRIV_PATH = os.path.join(KEYDIR, "af_f4_t10_fw_signing_key.pem")   # OFFLINE, never commit
PUB_PATH = os.path.join(KEYDIR, "af_f4_t10_fw_public_key.pem")     # committed / embedded


# ── key handling ────────────────────────────────────────────────────────────
def load_private():
    if not os.path.exists(PRIV_PATH):
        raise SystemExit("private key not found: %s (run: af_f4_t10_fwsig.py keygen)" % PRIV_PATH)
    with open(PRIV_PATH, "rb") as f:
        return serialization.load_pem_private_key(f.read(), password=None)


def load_public(pubkey_pem=None):
    path = pubkey_pem or PUB_PATH
    if not os.path.exists(path):
        raise SystemExit("public key not found: %s" % path)
    with open(path, "rb") as f:
        return serialization.load_pem_public_key(f.read())


def _meta_from(path, data):
    """Best-effort board_id / product / version for the manifest (informational)."""
    board_id = None
    if path.endswith(".apj"):
        try:
            board_id = json.loads(data).get("board_id")
        except Exception:
            pass
    base = os.path.basename(path)
    m = re.match(r"^(.*)-v(\d+\.\d+\.\d+)", base)
    product = m.group(1) if m else None
    version = m.group(2) if m else None
    return board_id, product, version


# ── subcommands ─────────────────────────────────────────────────────────────
def cmd_keygen(args):
    os.makedirs(KEYDIR, exist_ok=True)
    if os.path.exists(PRIV_PATH) and not args.force:
        raise SystemExit("refusing to overwrite existing key: %s (use --force)" % PRIV_PATH)
    priv = Ed25519PrivateKey.generate()
    with open(PRIV_PATH, "wb") as f:
        f.write(priv.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption()))
    os.chmod(PRIV_PATH, 0o600)
    with open(PUB_PATH, "wb") as f:
        f.write(priv.public_key().public_bytes(
            serialization.Encoding.PEM,
            serialization.PublicFormat.SubjectPublicKeyInfo))
    raw_pub = priv.public_key().public_bytes(
        serialization.Encoding.Raw, serialization.PublicFormat.Raw)
    print("AF-F4 T10 firmware signing key generated:")
    print("  private -> %s   (KEEP OFFLINE — never commit)" % PRIV_PATH)
    print("  public  -> %s" % PUB_PATH)
    print("  public key raw (base64, embed in web/CLI verifier):")
    print("    %s" % base64.b64encode(raw_pub).decode())


def cmd_sign(args):
    with open(args.firmware, "rb") as f:
        data = f.read()
    priv = load_private()
    signature = priv.sign(data)  # Ed25519 over raw file bytes
    board_id, product, version = _meta_from(args.firmware, data)
    manifest = {
        "schema": SCHEMA,
        "file": os.path.basename(args.firmware),
        "product": product,
        "version": version,
        "board_id": board_id,
        "size": len(data),
        "hash_alg": "SHA-256",
        "sha256": hashlib.sha256(data).hexdigest(),
        "sig_alg": "Ed25519",
        "key_id": KEY_ID,
        "signature": base64.b64encode(signature).decode(),
        "signed_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "signed_by": "AF-F4 T10 firmware release key",
    }
    out = args.out or (args.firmware + MANIFEST_EXT)
    with open(out, "w") as f:
        f.write(json.dumps(manifest, indent=2) + "\n")
    print("[AF-F4 T10 sign] signed %s (%d bytes)" % (manifest["file"], manifest["size"]))
    print("  board_id  %s   version %s" % (board_id, version))
    print("  sha256    %s" % manifest["sha256"])
    print("  ed25519   %s" % manifest["signature"])
    print("  manifest  -> %s" % out)


def verify_file(firmware_path, manifest_path=None, pubkey_pem=None, log=print):
    """Return True iff the firmware matches its AF-F4 T10-signed manifest.

    Importable gate for the CLI updater. Fails CLOSED on any mismatch and logs
    the exact reason (usable as certification back-data).
    """
    with open(firmware_path, "rb") as f:
        data = f.read()
    manifest_path = manifest_path or (firmware_path + MANIFEST_EXT)
    if not os.path.exists(manifest_path):
        log("  [AF-F4 T10 verify] FAIL: manifest not found (%s) — unsigned firmware rejected" % manifest_path)
        return False
    with open(manifest_path) as f:
        man = json.load(f)

    # 1) size
    if man.get("size") != len(data):
        log("  [AF-F4 T10 verify] FAIL: size %d != manifest %s" % (len(data), man.get("size")))
        return False
    # 2) SHA-256 (fast integrity + display)
    digest = hashlib.sha256(data).hexdigest()
    if digest != man.get("sha256"):
        log("  [AF-F4 T10 verify] FAIL: SHA-256 mismatch (image modified)")
        log("      file     %s" % digest)
        log("      manifest %s" % man.get("sha256"))
        return False
    # 3) Ed25519 signature over raw bytes (cryptographic authenticity)
    try:
        load_public(pubkey_pem).verify(base64.b64decode(man["signature"]), data)
    except Exception:
        log("  [AF-F4 T10 verify] FAIL: Ed25519 signature INVALID — not signed with the AF-F4 T10 key or tampered")
        return False
    # 4) .apj board_id cross-check
    if firmware_path.endswith(".apj"):
        try:
            bid = json.loads(data).get("board_id")
            if man.get("board_id") is not None and bid != man.get("board_id"):
                log("  [AF-F4 T10 verify] FAIL: board_id %s != manifest %s" % (bid, man.get("board_id")))
                return False
        except Exception:
            pass
    log("  [AF-F4 T10 verify] PASS: AF-F4 T10 Ed25519 signature valid (key_id=%s)" % man.get("key_id"))
    log("      file=%s board_id=%s version=%s sha256=%s…"
        % (man.get("file"), man.get("board_id"), man.get("version"), digest[:16]))
    return True


def cmd_verify(args):
    ok = verify_file(args.firmware, args.manifest, args.pubkey)
    sys.exit(0 if ok else 1)


def main():
    ap = argparse.ArgumentParser(description="AF-F4 T10 firmware release integrity (Ed25519).")
    sub = ap.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("keygen", help="generate the AF-F4 T10 Ed25519 signing keypair")
    g.add_argument("--force", action="store_true")
    g.set_defaults(func=cmd_keygen)
    s = sub.add_parser("sign", help="sign a firmware file -> <file>%s" % MANIFEST_EXT)
    s.add_argument("firmware")
    s.add_argument("--out")
    s.set_defaults(func=cmd_sign)
    v = sub.add_parser("verify", help="verify a firmware file against its manifest")
    v.add_argument("firmware")
    v.add_argument("--manifest")
    v.add_argument("--pubkey")
    v.set_defaults(func=cmd_verify)
    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
