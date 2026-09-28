<script setup lang="ts">
import type { List } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"

const props = defineProps<{
  node: List
  state: MarkdownState
}>()

const tag = computed(() => (props.node.ordered ? "ol" : "ul"))
const start = computed(() =>
  props.node.ordered ? (props.node.start ?? undefined) : undefined,
)
const markerClass = computed(() =>
  props.node.ordered ? "list-decimal" : "list-disc",
)
</script>

<template>
  <component
    :is="tag"
    :start="start"
    class="my-3 space-y-1 pl-6 marker:text-ink-muted"
    :class="markerClass"
  >
    <slot />
  </component>
</template>
