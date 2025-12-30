FROM rust:1.86-slim

SHELL ["bash", "-c"]

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    protobuf-compiler \
    clang \
    make \
    g++ \
    build-essential \
    python3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install WASM target for Linera contracts
RUN rustup target add wasm32-unknown-unknown

# Install Linera toolchain
RUN cargo install --locked linera-service@0.15.5 linera-storage-service@0.15.5

# Install Node.js via nvm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.40.3/install.sh | bash \
    && . ~/.nvm/nvm.sh \
    && nvm install lts/iron \
    && npm install -g pnpm

# Set production environment
ENV NODE_ENV=production

WORKDIR /build

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -sf http://localhost:5173 || exit 1

EXPOSE 5173 3001 8080 9001 13001

ENTRYPOINT ["bash", "/build/run.bash"]

