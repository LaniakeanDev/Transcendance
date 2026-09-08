#!/bin/sh
# Runs automatically via the nginx image's /docker-entrypoint.d/ hook.
# Generates a self-signed cert once, then reuses it (persisted in the `certs` volume).
set -e

CERT_DIR=/etc/nginx/certs
CRT="$CERT_DIR/fullchain.pem"
KEY="$CERT_DIR/privkey.pem"

if [ -s "$CRT" ] && [ -s "$KEY" ]; then
    echo "self-signed-cert: existing certificate found, reusing it"
    exit 0
fi

echo "self-signed-cert: generating a new self-signed certificate"
mkdir -p "$CERT_DIR"
openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$KEY" -out "$CRT" \
    -subj "/C=FR/O=42/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
chmod 600 "$KEY"
