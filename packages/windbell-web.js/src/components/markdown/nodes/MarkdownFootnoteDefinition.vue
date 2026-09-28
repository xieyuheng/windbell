<script setup lang="ts">
import type { FootnoteDefinition } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"

const props = defineProps<{
  node: FootnoteDefinition
  state: MarkdownState
}>()

const number = computed(() =>
  props.state.footnoteNumbers.get(props.node.identifier),
)
</script>

<template>
  <section
    :id="`markdown-footnote-${node.identifier}`"
    class="my-3 text-sm text-ink-muted"
  >
    <div class="flex gap-2">
      <span class="shrink-0">{{ number ?? "?" }}.</span>
      <div class="min-w-0 flex-1"><slot /></div>
    </div>
  </section>
</template>
