<script setup lang="ts">
import type { TableRow } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: TableRow
  state: MarkdownState
}>()
</script>

<template>
  <tr class="border-b border-line">
    <slot />
  </tr>
</template>
