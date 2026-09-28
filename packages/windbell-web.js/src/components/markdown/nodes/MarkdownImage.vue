<script setup lang="ts">
import type { Image } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"
import { safeUrl } from "../markdownUrl"

const props = defineProps<{
  node: Image
  state: MarkdownState
}>()

const src = computed(() => safeUrl(props.node.url, { image: true }))
</script>

<template>
  <img
    v-if="src !== undefined"
    class="my-2 max-w-full rounded"
    :src="src"
    :alt="node.alt ?? ''"
    :title="node.title ?? undefined"
    loading="lazy"
  />
  <span v-else>{{ node.alt ?? "" }}</span>
</template>
