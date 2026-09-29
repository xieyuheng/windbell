<script setup lang="ts">
import type { Html } from "mdast"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Html
  state: MarkdownState
}>()
</script>

<template>
  <span class="whitespace-pre-wrap font-mono text-ink-muted">{{
    node.value
  }}</span>
</template>
