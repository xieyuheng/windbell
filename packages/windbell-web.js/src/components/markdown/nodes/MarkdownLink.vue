<script setup lang="ts">
import type { Link } from "mdast"
import { computed } from "vue"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"
import { safeUrl } from "../markdownUrl.ts"

const props = defineProps<{
  node: Link
  state: MarkdownState
}>()

const href = computed(() => safeUrl(props.node.url))
</script>

<template>
  <a
    v-if="href !== undefined"
    :href="href"
    :title="node.title ?? undefined"
    class="text-info underline underline-offset-2"
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
