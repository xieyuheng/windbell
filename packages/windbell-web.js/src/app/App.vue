<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { RouterView } from "vue-router"
import { useTheme } from "./theme"

const { locale } = useI18n()
const theme = useTheme()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  meta: [
    {
      name: "theme-color",
      content: theme.resolved === "dark" ? "#181818" : "#fafaf9",
    },
  ],
}))
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-paper pb-[env(safe-area-inset-bottom,0px)] text-ink transition-colors"
  >
    <RouterView />
  </div>
</template>
