<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import Markdown from "../../markdown/Markdown.vue"

defineProps<{
  sign: S.PersonaSign | S.UserSign | S.ReasoningSign | S.AssistantSign
}>()
</script>

<template>
  <Markdown :text="sign.content" />
</template>
