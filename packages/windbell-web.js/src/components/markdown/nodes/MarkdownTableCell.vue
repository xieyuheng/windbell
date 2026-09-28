<script setup lang="ts">
import type { TableCell } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: TableCell
  state: MarkdownState
}>()
</script>

<template>
  <td class="border border-line px-2 py-1 align-top"><slot /></td>
</template>
