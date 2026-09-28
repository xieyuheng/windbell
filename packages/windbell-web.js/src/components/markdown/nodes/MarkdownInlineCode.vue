<script setup lang="ts">
import type { InlineCode } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: InlineCode
  state: MarkdownState
}>()
</script>

<template>
  <code class="rounded bg-paper-deep px-1 py-0.5 font-mono text-sm">{{
    node.value
  }}</code>
</template>
