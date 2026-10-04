<script setup lang="ts">
import type { FootnoteDefinition } from "mdast"
import { computed } from "vue"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState.ts"

const props = defineProps<{
  node: FootnoteDefinition
  state: MarkdownState
}>()

const number = computed(() =>
  props.state.footnoteNumbers.get(props.node.identifier),
)
</script>

<template>
  <section :id="`markdown-footnote-${node.identifier}`" class="my-3 text-ink">
    <div class="flex gap-2">
      <span class="shrink-0">{{ number ?? "?" }}.</span>
      <div class="min-w-0 flex-1">
        <MarkdownNode
          v-for="(child, index) in node.children"
          :key="index"
          :node="child"
          :state="state"
        />
      </div>
    </div>
  </section>
</template>
