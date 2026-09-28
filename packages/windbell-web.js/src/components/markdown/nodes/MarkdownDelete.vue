<script setup lang="ts">
import type { Delete } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Delete
  state: MarkdownState
}>()
</script>

<template>
  <del class="text-ink-muted"><slot /></del>
</template>
