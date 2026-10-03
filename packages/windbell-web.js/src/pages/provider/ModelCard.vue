<script setup lang="ts">
import type { ProviderModelEntry } from "@xieyuheng/semiosis.js"
import Card from "../../components/card/Card.vue"
import DeepSeekModelCard from "./DeepSeekModelCard.vue"
import ModelCardToolbar from "./ModelCardToolbar.vue"
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
  <Card as="article">
    <template #tag>
      <h2 class="break-all font-mono text-sm text-ink">
        {{ entry.name }}
      </h2>
    </template>

    <div class="flex flex-col gap-4 p-2">
      <ModelCardToolbar
        :enabled="entry.enabled"
        :is-default="entry.isDefault"
        :busy="busy"
        @enable="emit('enable')"
        @disable="emit('disable')"
        @set-default="emit('setDefault')"
      />

      <DeepSeekModelCard
        v-if="entry.providerName === 'deepseek'"
        :entry="entry"
      />
      <OpenRouterModelCard
        v-else-if="entry.providerName === 'openrouter'"
        :entry="entry"
      />
    </div>
  </Card>
</template>
