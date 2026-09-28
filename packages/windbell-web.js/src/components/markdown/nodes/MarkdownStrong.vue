<script setup lang="ts">
import type { Strong } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Strong
  state: MarkdownState
}>()
</script>

<template>
  <strong class="font-semibold"><slot /></strong>
</template>
