#!/usr/bin/env bash

set -eu

# === Linera Localnet Setup ===
eval "$(linera net helper)"
linera_spawn linera net up --with-faucet

export LINERA_FAUCET_URL=http://localhost:8080

# Remove existing wallet to allow fresh init (for reruns)
rm -rf /root/.config/linera 2>/dev/null || true

linera wallet init --faucet="$LINERA_FAUCET_URL"
linera wallet request-chain --faucet="$LINERA_FAUCET_URL"

# === Build KYA Registry Contract ===
echo "Building KYA Registry contract..."
cd /build
cargo build -p kya-registry --release --target wasm32-unknown-unknown

# === Publish to Linera ===
echo "Publishing KYA Registry to Linera..."
linera publish-and-create \
    /build/target/wasm32-unknown-unknown/release/kya-registry-contract.wasm \
    /build/target/wasm32-unknown-unknown/release/kya-registry-service.wasm

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
