<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"

defineProps<{
  sign: S.ErrorSign
}>()
</script>

<template>
  <pre
    class="thin-scrollbar overflow-x-auto whitespace-pre-wrap font-mono text-danger"
    >{{ sign.message }}</pre>
</template>
