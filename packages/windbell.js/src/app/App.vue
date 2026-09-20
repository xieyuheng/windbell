<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { RouterView } from "vue-router"
import AppHeader from "./AppHeader.vue"
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
      content: theme.resolved === "dark" ? "#0a0a0a" : "#fafafa",
    },
  ],
}))
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-white text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100"
  >
    <AppHeader />
    <RouterView />
  </div>
</template>
