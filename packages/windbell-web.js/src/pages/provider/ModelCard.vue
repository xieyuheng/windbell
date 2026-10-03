<script setup lang="ts">
import type { ProviderModelEntry } from "@xieyuheng/semiosis.js"
import DeepSeekModelCard from "./DeepSeekModelCard.vue"
import OpenRouterModelCard from "./OpenRouterModelCard.vue"

defineProps<{
  entry: ProviderModelEntry
}>()
</script>

<template>
  <DeepSeekModelCard v-if="entry.providerName === 'deepseek'" :entry="entry" />
  <OpenRouterModelCard
    v-else-if="entry.providerName === 'openrouter'"
    :entry="entry"
  />
</template>
