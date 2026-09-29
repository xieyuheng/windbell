<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"

defineProps<{
  sign: S.ToolOutputSign
}>()
</script>

<template>
  <div
    class="thin-scrollbar overflow-x-auto whitespace-pre font-mono"
    >{{ sign.content }}</div>
</template>
