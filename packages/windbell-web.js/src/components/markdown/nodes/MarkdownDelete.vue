<script setup lang="ts">
import type { Delete } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Delete
  state: MarkdownState
}>()
</script>

<template>
  <del class="text-ink">
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </del>
</template>
