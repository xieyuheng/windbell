<script setup lang="ts">
import type { Definition } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Definition
  state: MarkdownState
}>()
</script>

<template>
  <span v-if="false" />
</template>
