<script setup lang="ts">
import type { Root } from "mdast"
import { computed } from "vue"
import MarkdownNode from "./MarkdownNode.vue"
import { createMarkdownState } from "./markdownState"
import { parseMarkdown } from "./parseMarkdown"

const props = defineProps<{
  source?: string
  root?: Root
}>()

const root = computed(() => props.root ?? parseMarkdown(props.source ?? ""))
const state = computed(() => createMarkdownState(root.value))
</script>

<template>
  <div class="text-ink">
    <MarkdownNode :node="root" :state="state" />
  </div>
</template>
