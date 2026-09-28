<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  content: Uint8Array
}>()

const text = computed(() => new TextDecoder().decode(props.content))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <pre
      class="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-sm text-ink"
      >{{ text }}</pre>
  </div>
</template>
