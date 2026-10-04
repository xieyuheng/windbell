<script setup lang="ts">
import type { FootnoteReference } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState.ts"

const props = defineProps<{
  node: FootnoteReference
  state: MarkdownState
}>()

const number = computed(() =>
  props.state.footnoteNumbers.get(props.node.identifier),
)
</script>

<template>
  <sup>
    <a
      :id="`markdown-footnote-ref-${node.identifier}`"
      :href="`#markdown-footnote-${node.identifier}`"
      class="underline underline-offset-2"
    >
      {{ number ?? "?" }}
    </a>
  </sup>
</template>
