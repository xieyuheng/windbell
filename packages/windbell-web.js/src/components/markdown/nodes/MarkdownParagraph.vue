<script setup lang="ts">
import type { Paragraph } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Paragraph
  state: MarkdownState
}>()
</script>

<template>
  <p class="my-3 first:mt-0 last:mb-0"><slot /></p>
</template>
