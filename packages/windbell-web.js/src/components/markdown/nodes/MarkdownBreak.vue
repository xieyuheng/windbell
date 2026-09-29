<script setup lang="ts">
import type { Break } from "mdast"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Break
  state: MarkdownState
}>()
</script>

<template>
  <br />
</template>
