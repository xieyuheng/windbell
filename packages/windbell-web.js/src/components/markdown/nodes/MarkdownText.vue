<script setup lang="ts">
import type { Text } from "mdast"
import type { MarkdownState } from "../markdownState.ts"

defineProps<{
  node: Text
  state: MarkdownState
}>()
</script>

<template>{{ node.value }}</template>
