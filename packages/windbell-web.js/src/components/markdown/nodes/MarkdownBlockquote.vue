<script setup lang="ts">
import type { Blockquote } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Blockquote
  state: MarkdownState
}>()
</script>

<template>
  <blockquote class="my-3 border-l-4 border-line pl-4 text-ink-muted">
    <slot />
  </blockquote>
</template>
