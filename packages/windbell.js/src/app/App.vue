<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import AppShellDesktop from "./AppShellDesktop.vue"
import AppShellMobile from "./AppShellMobile.vue"
import { useTheme } from "./theme"
import { useMediaQuery } from "./useMediaQuery"

const { locale } = useI18n()
const theme = useTheme()
const isMobile = useMediaQuery("(max-width: 767px)")

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
  <AppShellMobile v-if="isMobile" />
  <AppShellDesktop v-else />
</template>
