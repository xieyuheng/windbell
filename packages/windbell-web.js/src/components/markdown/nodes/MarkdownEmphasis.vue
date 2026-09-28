<script setup lang="ts">
import type { Emphasis } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Emphasis
  state: MarkdownState
}>()
</script>

<template>
  <em>
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </em>
</template>
