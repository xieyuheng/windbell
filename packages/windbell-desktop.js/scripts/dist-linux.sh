#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f "../windbell-web.js/dist/index.html" ]; then
  echo "error: windbell-web dist not found; build windbell-web first" >&2
  exit 1
fi

if [ ! -f "dist/main.mjs" ]; then
  echo "error: windbell-desktop dist not found; build windbell-desktop first" >&2
  exit 1
fi

export ELECTRON_MIRROR="${ELECTRON_MIRROR:-https://npmmirror.com/mirrors/electron/}"
export ELECTRON_BUILDER_BINARIES_MIRROR="${ELECTRON_BUILDER_BINARIES_MIRROR:-https://npmmirror.com/mirrors/electron-builder-binaries/}"

exec npx electron-builder \
  --linux AppImage \
  --config electron-builder.yml \
  --publish never \
  "$@"
