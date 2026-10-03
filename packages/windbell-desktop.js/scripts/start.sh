#!/usr/bin/env bash

set -e

(cd ../windbell-web.js && ./scripts/build.sh)

./scripts/build.sh

npx electron .
