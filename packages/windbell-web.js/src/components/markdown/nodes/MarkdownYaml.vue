<script setup lang="ts">
import type { Yaml } from "mdast"
import type { MarkdownState } from "../markdownState"

defineProps<{
  node: Yaml
  state: MarkdownState
}>()
</script>

<template>
  <span v-if="false" />
</template>
