<script setup lang="ts">
import { computed } from "vue"
import type { MarkdownState } from "./markdownState"
import type { MarkdownNode as MarkdownNodeType } from "./markdownTypes"
import { resolveMarkdownNodeComponent } from "./resolveMarkdownNodeComponent"

defineOptions({ name: "MarkdownNode" })

const props = defineProps<{
  node: MarkdownNodeType
  state: MarkdownState
}>()

const component = computed(() => resolveMarkdownNodeComponent(props.node))
</script>

<template>
  <component :is="component" :node="node" :state="state" />
</template>
