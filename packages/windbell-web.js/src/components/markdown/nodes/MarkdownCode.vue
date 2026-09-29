<script setup lang="ts">
import type { Code } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Code
  state: MarkdownState
}>()
</script>

<template>
  <pre
    class="my-4 overflow-x-auto rounded bg-paper-deep px-3 py-2 thin-scrollbar"
  ><code class="font-mono">{{ node.value }}</code></pre>
</template>
