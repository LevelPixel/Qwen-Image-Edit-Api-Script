#!/usr/bin/env bash
# -----------------------------
# run_with_portable_npm_LINUX.sh
# -----------------------------
set -euo pipefail

PORTABLE_DIR="portable_node"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -x "${SCRIPT_DIR}/${PORTABLE_DIR}/bin/node" ]; then
  echo "Error: ${PORTABLE_DIR}/bin/node not found. Run install_portable_npm_LINUX.sh first."
  exit 1
fi

if [ $# -eq 0 ]; then
  if [ -f "${SCRIPT_DIR}/qwen_image_edit_api_script.js" ]; then
    echo "Running: portable node qwen_image_edit_api_script.js"
    "${SCRIPT_DIR}/${PORTABLE_DIR}/bin/node" "${SCRIPT_DIR}/qwen_image_edit_api_script.js"
    exit $?
  else
    echo "No arguments and qwen_image_edit_api_script.js not found in current folder."
    echo "Usage:"
    echo "  ./run_with_portable_npm_LINUX.sh npm install"
    echo "  ./run_with_portable_npm_LINUX.sh npm run start"
    echo "  ./run_with_portable_npm_LINUX.sh node your_script.js"
    exit 1
  fi
else
  first="$1"
  shift
  if [ "$first" = "npm" ] || [ "$first" = "NPM" ]; then
    if [ -x "${SCRIPT_DIR}/npm" ]; then
      "${SCRIPT_DIR}/npm" "$@"
      exit $?
    else
      echo "Local npm wrapper not found. Run install_portable_npm_LINUX.sh first."
      exit 1
    fi
  elif [ "$first" = "node" ] || [ "$first" = "Node" ]; then
    "${SCRIPT_DIR}/${PORTABLE_DIR}/bin/node" "$@"
    exit $?
  else
    "${SCRIPT_DIR}/${PORTABLE_DIR}/bin/node" "$first" "$@"
    exit $?
  fi
fi
