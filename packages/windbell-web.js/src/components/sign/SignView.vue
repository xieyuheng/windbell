<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { resolveSignView } from "./views/registry.ts"

const props = defineProps<{
  sign: S.Sign
}>()

const view = computed(() => resolveSignView(props.sign))
</script>

<template>
  <component :is="view.component" :sign="sign" />
</template>
