<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { RouterView } from "vue-router"
import { useColorMode } from "./color-mode.ts"
import { useTheme } from "./theme.ts"

const { locale } = useI18n()
const colorMode = useColorMode()
const { activeTheme } = useTheme()

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  meta: [
    {
      name: "theme-color",
      content: activeTheme.value.colors[colorMode.resolved].paper,
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
