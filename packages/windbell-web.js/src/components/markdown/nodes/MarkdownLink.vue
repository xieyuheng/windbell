<script setup lang="ts">
import type { Link } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"
import { safeUrl } from "../markdownUrl"

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
    <slot />
  </a>
  <span v-else><slot /></span>
</template>
