<script setup lang="ts">
import type { InlineCode } from "mdast"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: InlineCode
  state: MarkdownState
}>()
</script>

<template>
  <code class="rounded bg-paper-deep px-1 py-0.5 font-mono">{{
    node.value
  }}</code>
</template>
