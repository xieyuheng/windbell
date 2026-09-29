<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import type { SignState } from "../signState.ts"

defineProps<{
  sign: S.ToolOutputSign
  state: SignState
}>()
</script>

<template>
  <div class="thin-scrollbar overflow-x-auto whitespace-pre font-mono">
    {{ sign.content }}
  </div>
</template>
