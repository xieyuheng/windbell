<script setup lang="ts">
import type { Paragraph } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Paragraph
  state: MarkdownState
}>()
</script>

<template>
  <p class="markdown-paragraph my-3 first:mt-0 last:mb-0">
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </p>
</template>
