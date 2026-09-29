<script setup lang="ts">
import type { Blockquote } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Blockquote
  state: MarkdownState
}>()
</script>

<template>
  <blockquote class="my-3 border-l-4 border-line pl-4 text-ink-muted">
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </blockquote>
</template>
