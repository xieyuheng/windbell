<script setup lang="ts">
import type { LinkReference } from "mdast"
import { computed } from "vue"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"
import { safeUrl } from "../markdownUrl.ts"

const props = defineProps<{
  node: LinkReference
  state: MarkdownState
}>()

const definition = computed(() =>
  props.state.definitions.get(props.node.identifier),
)
const href = computed(() => safeUrl(definition.value?.url))
</script>

<template>
  <a
    v-if="href !== undefined"
    :href="href"
    :title="definition?.title ?? undefined"
    class="underline underline-offset-2"
    target="_blank"
    rel="noopener noreferrer"
  >
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </a>
  <span v-else>
    <MarkdownNode
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :state="state"
    />
  </span>
</template>
