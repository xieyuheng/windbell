<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"

const props = defineProps<{
  sign: S.ToolCallSign
}>()

const argumentsText = computed(() => {
  try {
    return JSON.stringify(JSON.parse(props.sign.arguments), null, 2) ?? ""
  } catch {
    return props.sign.arguments
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="font-mono font-bold">
      {{ sign.name }}
    </div>

    <div class="thin-scrollbar overflow-x-auto whitespace-pre font-mono">
      {{ argumentsText }}
    </div>
  </div>
</template>
