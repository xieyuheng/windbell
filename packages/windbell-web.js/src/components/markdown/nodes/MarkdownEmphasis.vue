<script setup lang="ts">
import type { Emphasis } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Emphasis
  state: MarkdownState
}>()
</script>

<template>
  <em><slot /></em>
</template>
