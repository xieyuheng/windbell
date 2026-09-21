#!/usr/bin/env bash

set -e

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
  --model mock/max-steps \
  --prompts mock/prompts/max-steps.md \
  --max-steps 2 \
  > snapshot/max-steps.out

node src/main.ts batch \
  --model mock/truncate-output \
  --prompts mock/prompts/truncate-output.md \
  --max-output-chars 4 \
  > snapshot/truncate-output.out
