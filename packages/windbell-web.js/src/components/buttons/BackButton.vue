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
    router.push({ name: "dashboard" })
  }
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-2 rounded border-2 border-line px-2 py-1.5 text-ink transition-colors hover:bg-line"
    @click="goBack()"
  >
    <ArrowLeft :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.back") }}</span>
  </button>
</template>
