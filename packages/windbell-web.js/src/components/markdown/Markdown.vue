<script setup lang="ts">
import type { Root } from "mdast"
import { computed } from "vue"
import MarkdownNode from "./MarkdownNode.vue"
import { createMarkdownState } from "./markdownState.ts"
import { parseMarkdown } from "./parseMarkdown.ts"

const props = defineProps<{
  text: string
}>()

const root = computed(() => parseMarkdown(props.text))
const state = computed(() => createMarkdownState(root.value))
</script>

<template>
  <div class="text-ink">
    <MarkdownNode :node="root" :state="state" />
  </div>
</template>
