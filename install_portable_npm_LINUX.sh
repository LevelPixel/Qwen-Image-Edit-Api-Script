#!/usr/bin/env bash
# -----------------------------
# install_portable_npm_LINUX.sh
# -----------------------------
set -euo pipefail

NODE_VERSION="20.8.0"
PORTABLE_DIR="portable_node"
TARBALL="node.tar.xz"

echo
echo "=== Preparing portable Node/npm (version ${NODE_VERSION}) ==="

ARCH="$(uname -m)"
if [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then
  DIST="linux-x64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  DIST="linux-arm64"
else
  echo "Unsupported architecture: $ARCH"
  exit 1
fi

DOWNLOAD_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${DIST}.tar.xz"

echo "Downloading: ${DOWNLOAD_URL}"
if command -v curl >/dev/null 2>&1; then
  curl -fSL "${DOWNLOAD_URL}" -o "${TARBALL}"
elif command -v wget >/dev/null 2>&1; then
  wget -O "${TARBALL}" "${DOWNLOAD_URL}"
else
  echo "Error: neither curl nor wget is available."
  exit 1
fi

echo "Extracting ${TARBALL} ..."
mkdir -p tmp_node_extract
tar -xJf "${TARBALL}" -C tmp_node_extract

EXTRACTED_DIR="tmp_node_extract/node-v${NODE_VERSION}-${DIST}"
if [ ! -d "${EXTRACTED_DIR}" ]; then
  echo "Extracted folder ${EXTRACTED_DIR} not found. Listing tmp_node_extract:"
  ls -la tmp_node_extract
  exit 1
fi

if [ -d "${PORTABLE_DIR}" ]; then
  echo "Removing old ${PORTABLE_DIR} ..."
  rm -rf "${PORTABLE_DIR}"
fi

mv "${EXTRACTED_DIR}" "${PORTABLE_DIR}"
rm -rf tmp_node_extract

SCRIPT_DIR="$(pwd)"
NPM_WRAPPER="${SCRIPT_DIR}/npm"
echo "Creating npm wrapper at ${NPM_WRAPPER} ..."
cat > "${NPM_WRAPPER}" <<'NPM_WRAPPER_CONTENT'
#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/portable_node/bin/node" "$SCRIPT_DIR/portable_node/lib/node_modules/npm/bin/npm-cli.js" "$@"
NPM_WRAPPER_CONTENT
chmod +x "${NPM_WRAPPER}"

echo "Installing dependencies: axios, mime-types, dotenv"
"${PWD}/${PORTABLE_DIR}/bin/node" "${PWD}/${PORTABLE_DIR}/lib/node_modules/npm/bin/npm-cli.js" install axios mime-types dotenv --no-audit --no-fund

rm -f "${TARBALL}"

echo
echo "=== Done. Portable Node/npm deployed to ./${PORTABLE_DIR} ==="
echo "Use ./npm to run npm (or use run_with_portable_npm.sh)"
