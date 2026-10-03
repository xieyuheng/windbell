#!/usr/bin/env bash

set -e

(
  cd ../windbell-web.js
  ./scripts/clean.sh
  ./scripts/build.sh
)

./scripts/clean.sh
./scripts/build.sh

export ELECTRON_MIRROR="${ELECTRON_MIRROR:-https://npmmirror.com/mirrors/electron/}"
export ELECTRON_BUILDER_BINARIES_MIRROR="${ELECTRON_BUILDER_BINARIES_MIRROR:-https://npmmirror.com/mirrors/electron-builder-binaries/}"

npx electron-builder --config electron-builder.yml
