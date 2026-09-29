<script setup lang="ts">
import { computed } from "vue"
import type { MarkdownState } from "./markdownState.ts"
import type { MarkdownNode as MarkdownNodeType } from "./markdownTypes.ts"
import { resolveMarkdownNodeComponent } from "./resolveMarkdownNodeComponent.ts"

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
