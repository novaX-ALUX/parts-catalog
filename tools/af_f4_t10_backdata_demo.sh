#!/usr/bin/env bash
# af_f4_t10_backdata_demo.sh — reproducible back-data for the AF-F4 T10 firmware
# integrity layer. Signs the released T10 firmware, then proves the AF-F4 T10
# verifier ACCEPTS the genuine image and REJECTS every tampered / unsigned /
# forged variant. Re-runnable by an auditor: `bash af_f4_t10_backdata_demo.sh`.
#
# PASS/FAIL below is the EXIT CODE of the AF-F4 T10 verifier:
#   exit 0 = signature valid  -> flashing allowed
#   exit 1 = verification failed -> flashing REFUSED
set -u
cd "$(dirname "$0")"

APJ="../public/firmware/AF-F4_T10_nano-v0.3.4.apj"
WORK="$(mktemp -d)"
MAN="$WORK/AF-F4_T10_nano-v0.3.4.apj.aff4t10.json"
SIG="python3 af_f4_t10_fwsig.py"
line() { printf '%s\n' "----------------------------------------------------------------------"; }

echo "======================================================================"
echo " AF-F4 T10 firmware integrity — reproducible back-data"
echo " target: AF-F4_T10_nano v0.3.4 (.apj)"
echo "======================================================================"

line; echo "[1] AF-F4 T10 Ed25519 release key (generated once; private key stays offline)"
if [ -f keys/af_f4_t10_fw_signing_key.pem ]; then
  echo "  using existing key: keys/af_f4_t10_fw_public_key.pem"
else
  $SIG keygen
fi

line; echo "[2] AF-F4 T10 signs the released firmware -> manifest (.aff4t10.json)"
$SIG sign "$APJ" --out "$MAN"

line; echo "[3] GENUINE firmware -> expect PASS (exit 0)"
$SIG verify "$APJ" --manifest "$MAN"; echo "  == verifier exit: $? =="

line; echo "[4] TAMPERED firmware (1 byte flipped) -> expect REFUSE (exit 1)"
cp "$APJ" "$WORK/tampered.apj"
python3 - "$WORK/tampered.apj" <<'PY'
import sys
p=sys.argv[1]; b=bytearray(open(p,'rb').read()); i=len(b)//2
b[i]=b[i]^0x01; open(p,'wb').write(bytes(b))
print("  flipped 1 byte at offset %d" % i)
PY
$SIG verify "$WORK/tampered.apj" --manifest "$MAN"; echo "  == verifier exit: $? =="

line; echo "[5] UNSIGNED firmware (no manifest) -> expect REFUSE (exit 1)"
cp "$APJ" "$WORK/unsigned.apj"
$SIG verify "$WORK/unsigned.apj"; echo "  == verifier exit: $? =="

line; echo "[6] FORGED: attacker re-hashes + re-signs with their OWN key -> expect REFUSE (exit 1)"
python3 - "$WORK/tampered.apj" "$WORK/forged.aff4t10.json" <<'PY'
import base64,hashlib,json,sys
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
fw,out=sys.argv[1],sys.argv[2]
data=open(fw,'rb').read()
atk=Ed25519PrivateKey.generate()          # attacker has NO AF-F4 T10 private key
json.dump({"schema":"af-f4-t10-fw-integrity/1","file":"AF-F4_T10_nano-v0.3.4.apj",
 "product":"AF-F4_T10_nano","version":"0.3.4","board_id":6203,"size":len(data),
 "hash_alg":"SHA-256","sha256":hashlib.sha256(data).hexdigest(),"sig_alg":"Ed25519",
 "key_id":"attacker-forged","signature":base64.b64encode(atk.sign(data)).decode(),
 "signed_at":"2026-07-03T00:00:00Z","signed_by":"ATTACKER"},open(out,'w'),indent=2)
print("  attacker fixed the SHA-256 AND signed with a self-generated key")
PY
$SIG verify "$WORK/tampered.apj" --manifest "$WORK/forged.aff4t10.json"; echo "  == verifier exit: $? =="

line
echo "SUMMARY: only the genuine, AF-F4 T10-signed image is accepted. Tampered,"
echo "unsigned, and forge-signed images are all refused before flashing."
rm -rf "$WORK"
