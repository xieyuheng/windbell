<script setup lang="ts">
import type { ImageReference } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState.ts"
import { safeUrl } from "../markdownUrl.ts"

const props = defineProps<{
  node: ImageReference
  state: MarkdownState
}>()

const definition = computed(() =>
  props.state.definitions.get(props.node.identifier),
)
const src = computed(() => safeUrl(definition.value?.url, { image: true }))
</script>

<template>
  <img
    v-if="src !== undefined"
    class="my-2 max-w-full rounded"
    :src="src"
    :alt="node.alt ?? definition?.label ?? ''"
    :title="definition?.title ?? undefined"
    loading="lazy"
  />
  <span v-else>{{ node.alt ?? node.label }}</span>
</template>
