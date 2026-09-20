#!/usr/bin/env bash

set -e

./scripts/check.sh
npx vite build
