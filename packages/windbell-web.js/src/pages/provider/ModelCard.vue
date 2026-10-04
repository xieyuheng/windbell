<script setup lang="ts">
import type { ProviderModelEntry } from "@xieyuheng/semiosis.js"
import DeepSeekModelCard from "./DeepSeekModelCard.vue"
import OpenRouterModelCard from "./OpenRouterModelCard.vue"

defineProps<{
  entry: ProviderModelEntry
  busy: boolean
}>()

const emit = defineEmits<{
  enable: []
  disable: []
  setDefault: []
}>()
</script>

<template>
  <DeepSeekModelCard
    v-if="entry.providerName === 'deepseek'"
    :entry="entry"
    :busy="busy"
    @enable="emit('enable')"
    @disable="emit('disable')"
    @set-default="emit('setDefault')"
  />

  <OpenRouterModelCard
    v-else-if="entry.providerName === 'openrouter'"
    :entry="entry"
    :busy="busy"
    @enable="emit('enable')"
    @disable="emit('disable')"
    @set-default="emit('setDefault')"
  />
</template>
