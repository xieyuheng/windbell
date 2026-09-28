<script setup lang="ts">
import type { Heading } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"

const props = defineProps<{
  node: Heading
  state: MarkdownState
}>()

const tag = computed(() => {
  const depth = Math.min(Math.max(props.node.depth, 1), 6)
  return `h${depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
})

const sizeClass = computed(() => {
  switch (props.node.depth) {
    case 1:
      return "text-2xl"
    case 2:
      return "text-xl"
    case 3:
      return "text-lg"
    case 4:
      return "text-base"
    case 5:
      return "text-sm"
    default:
      return "text-xs"
  }
})
</script>

<template>
  <component
    :is="tag"
    class="mb-3 mt-6 font-semibold first:mt-0"
    :class="sizeClass"
  >
    <slot />
  </component>
</template>
