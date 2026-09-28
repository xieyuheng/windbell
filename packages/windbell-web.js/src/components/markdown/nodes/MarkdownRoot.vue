<script setup lang="ts">
import type { Root } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Root
  state: MarkdownState
}>()
</script>

<template>
  <slot />
</template>
