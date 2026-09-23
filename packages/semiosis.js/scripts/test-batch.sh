#!/usr/bin/env bash

set -e

database_dir="$(mktemp -d)"
export WINDBELL_DATABASE="$database_dir"
trap 'rm -rf "$database_dir"' EXIT

mkdir -p snapshot

node src/main.ts batch \
  --model mock/conversation \
  --prompts mock/prompts/conversation.md \
  > snapshot/conversation.out

node src/main.ts batch \
  --model mock/tool-errors \
  --prompts mock/prompts/tool-errors.md \
  > snapshot/tool-errors.out

node src/main.ts batch \
  --model mock/truncate-output \
  --prompts mock/prompts/truncate-output.md \
  --max-output-chars 4 \
  > snapshot/truncate-output.out
