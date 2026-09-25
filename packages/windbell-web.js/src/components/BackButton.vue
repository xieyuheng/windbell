<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

const router = useRouter()
const { t } = useI18n()

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: "workspace-list" })
  }
}
</script>

<template>
  <button type="button" @click="goBack()">
    <ArrowLeft :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.back") }}</span>
  </button>
</template>
