<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import Markdown from "../../markdown/Markdown.vue"

const props = defineProps<{
  sign: S.ToolSign
}>()

const parametersText = computed(() =>
  JSON.stringify(props.sign.parameters, null, 2),
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="font-mono font-bold">
      {{ sign.name }}
    </div>

    <Markdown :text="sign.description" />

    <div class="thin-scrollbar overflow-x-auto whitespace-pre font-mono">
      {{ parametersText }}
    </div>
  </div>
</template>
