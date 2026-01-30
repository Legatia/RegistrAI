#!/usr/bin/env bash

set -eu

# === Linera Testnet Conway Setup ===
# Use public testnet faucet (not local testnet)
export LINERA_FAUCET_URL="${LINERA_FAUCET_URL:-https://faucet.testnet-conway.linera.net}"

echo "=============================================="
echo "🔗 Connecting to Linera Testnet Conway"
echo "   Faucet: $LINERA_FAUCET_URL"
echo "=============================================="

# Initialize wallet with testnet faucet
rm -rf /root/.config/linera 2>/dev/null || true
echo "📦 Initializing wallet..."
linera wallet init --faucet="$LINERA_FAUCET_URL"
echo "🔑 Requesting chain from faucet..."
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# Verify connection
echo "📡 Verifying testnet connection..."
linera sync
BALANCE=$(linera query-balance 2>&1 || echo "0")
echo "✅ Connected to Conway Testnet! Balance: $BALANCE"

# === Build KYA Registry Contract ===
echo "Building KYA Registry contract..."
cd /build
cargo build -p kya-registry --release --target wasm32-unknown-unknown

# === Publish to Linera Testnet ===
echo "📦 Publishing KYA Registry to Conway Testnet..."
PUBLISH_OUTPUT=$(linera publish-and-create \
    /build/target/wasm32-unknown-unknown/release/kya-registry-contract.wasm \
    /build/target/wasm32-unknown-unknown/release/kya-registry-service.wasm 2>&1)

# Try to extract application ID
APP_ID=$(echo "$PUBLISH_OUTPUT" | grep -oE '[a-f0-9]{64}' | head -1 || true)
if [ -n "$APP_ID" ]; then
    echo "✅ Published! Application ID: $APP_ID"
    export LINERA_APP_ID="$APP_ID"
else
    echo "⚠️  Could not extract App ID from output:"
    echo "$PUBLISH_OUTPUT"
fi

echo "=============================================="
echo "✅ Linera Testnet Conway connection established!"
echo "=============================================="

# === Start Backend Server ===
echo "Starting API server..."
cd /build/server
source ~/.nvm/nvm.sh
# Remove host node_modules (macOS binaries don't work in Linux)
rm -rf node_modules
npm install
npm run dev &

# === Start Frontend ===
echo "Starting frontend..."
cd /build/web
rm -rf node_modules
npm install
npm run dev -- --host 0.0.0.0

# Keep running
wait
