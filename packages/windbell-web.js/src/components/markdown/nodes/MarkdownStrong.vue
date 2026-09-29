<script setup lang="ts">
import type { Strong } from "mdast"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Strong
  state: MarkdownState
}>()
</script>

<template>
  <strong class="font-semibold">
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </strong>
</template>
