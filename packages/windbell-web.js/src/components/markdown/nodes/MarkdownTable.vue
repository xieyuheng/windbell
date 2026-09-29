<script setup lang="ts">
import type { Table } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Table
  state: MarkdownState
}>()
</script>

<template>
  <div class="my-4 overflow-x-auto thin-scrollbar">
    <table class="w-full border-collapse text-left">
      <MarkdownNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :state="state"
      />
    </table>
  </div>
</template>
