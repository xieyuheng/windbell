<script setup lang="ts">
import type { Heading } from "mdast"
import { computed } from "vue"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

const props = defineProps<{
  node: Heading
  state: MarkdownState
}>()

const tag = computed(() => {
  const depth = Math.min(Math.max(props.node.depth, 1), 6)
  return `h${depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
})

const sizeClass = computed(() => {
  if (props.node.depth === 1) return "text-xl"
  if (props.node.depth === 2) return "text-lg"
  return undefined
})

const prefix = computed(() =>
  "#".repeat(Math.min(Math.max(props.node.depth, 1), 6)),
)
</script>

<template>
  <component
    :is="tag"
    class="mb-3 mt-6 font-semibold first:mt-0"
    :class="sizeClass"
  >
    <span class="text-ink" aria-hidden="true"> {{ prefix }}{{ " " }} </span>
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </component>
</template>
