<script setup lang="ts">
import { Settings } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"

const { t } = useI18n()
</script>

<template>
  <RouterLink
    class="inline-flex items-center gap-2 rounded border-2 border-line px-2 py-1.5 text-ink transition-colors hover:bg-line"
    :to="{ name: 'settings' }"
  >
    <Settings :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.settings") }}</span>
  </RouterLink>
</template>
