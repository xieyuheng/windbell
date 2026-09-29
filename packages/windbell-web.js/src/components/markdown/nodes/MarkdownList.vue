<script setup lang="ts">
import type { List } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState.ts"
import MarkdownListItem from "./MarkdownListItem.vue"

const props = defineProps<{
  node: List
  state: MarkdownState
}>()

const tag = computed(() => (props.node.ordered ? "ol" : "ul"))
const start = computed(() =>
  props.node.ordered ? (props.node.start ?? undefined) : undefined,
)

function markerFor(index: number): string {
  if (!props.node.ordered) return "* "

  const start = props.node.start ?? 1
  return `${start + index}. `
}
</script>

<template>
  <component
    :is="tag"
    :start="start"
    class="markdown-list list-none space-y-1 pl-0"
  >
    <MarkdownListItem
      v-for="(item, index) in node.children"
      :key="index"
      :node="item"
      :state="state"
      :marker="markerFor(index)"
    />
  </component>
</template>
