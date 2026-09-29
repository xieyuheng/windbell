<script setup lang="ts">
import type { MarkdownState } from "../markdownState.ts"
import type { MarkdownNode } from "../markdownTypes.ts"

defineProps<{
  node: MarkdownNode
  state: MarkdownState
}>()
</script>

<template>
  <span class="rounded bg-warning/10 px-1 font-mono text-warning">
    unsupported: {{ node.type }}
  </span>
</template>
