<script setup lang="ts">
import type { ThematicBreak } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: ThematicBreak
  state: MarkdownState
}>()
</script>

<template>
  <hr class="my-6 border-line" />
</template>
