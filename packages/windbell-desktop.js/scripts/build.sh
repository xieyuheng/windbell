#!/usr/bin/env bash

set -e

./scripts/check.sh

mkdir -p dist

npx esbuild src/main.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --target=node24 \
  --external:electron \
  --outfile=dist/main.mjs
