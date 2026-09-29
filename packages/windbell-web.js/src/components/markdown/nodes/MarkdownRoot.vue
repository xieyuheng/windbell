<script setup lang="ts">
import type { Root } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Root
  state: MarkdownState
}>()
</script>

<template>
  <MarkdownNode
    v-for="(child, index) in node.children"
    :key="index"
    :node="child"
    :state="state"
  />
</template>
