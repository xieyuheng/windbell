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

const childNodes = computed<Array<MarkdownNodeType>>(() => {
  if (!("children" in props.node)) return []
  return props.node.children as Array<MarkdownNodeType>
})
</script>

<template>
  <component :is="component" :node="node" :state="state">
    <MarkdownNode
      v-for="(child, index) in childNodes"
      :key="index"
      :node="child"
      :state="state"
    />
  </component>
</template>
