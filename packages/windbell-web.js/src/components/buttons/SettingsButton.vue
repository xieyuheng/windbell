<script setup lang="ts">
import { Settings } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import MediumButton from "./MediumButton.vue"

const { t } = useI18n()
</script>

<template>
  <MediumButton :to="{ name: 'settings' }">
    <Settings :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.settings") }}</span>
  </MediumButton>
</template>
