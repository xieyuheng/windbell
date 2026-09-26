<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import type { RouteLocationRaw } from "vue-router"
import MediumButton from "./MediumButton.vue"

defineProps<{
  to: RouteLocationRaw
}>()

const { t } = useI18n()
</script>

<template>
  <MediumButton :to="to">
    <ArrowLeft :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.back") }}</span>
  </MediumButton>
</template>
