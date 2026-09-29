<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"

defineProps<{
  sign: S.Sign
}>()
</script>

<template>
  <pre
    class="thin-scrollbar overflow-x-auto whitespace-pre-wrap font-mono text-ink"
    >{{ JSON.stringify(sign, null, 2) }}</pre>
</template>
