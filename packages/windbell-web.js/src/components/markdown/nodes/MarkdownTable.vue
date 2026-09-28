<script setup lang="ts">
import type { Table } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Table
  state: MarkdownState
}>()
</script>

<template>
  <div class="my-4 overflow-x-auto thin-scrollbar">
    <table class="w-full border-collapse text-left text-sm">
      <slot />
    </table>
  </div>
</template>
