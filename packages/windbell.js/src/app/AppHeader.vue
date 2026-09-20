<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { setLocale, supportedLocales, type Locale } from "./i18n"
import { useTheme, type ThemeMode } from "./theme"

const { locale, t } = useI18n()
const theme = useTheme()

function onLocaleChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as Locale
  setLocale(value)
}

function onThemeChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as ThemeMode
  theme.setMode(value)
}
</script>

<template>
  <header
    class="flex items-center justify-between border-b border-neutral-200 px-5 py-3 dark:border-neutral-800"
  >
    <span class="font-semibold">{{ t("app.name") }}</span>

    <div class="flex items-center gap-4 text-sm">
      <label class="flex items-center gap-2">
        <span>{{ t("app.language") }}</span>
        <select
          :value="locale"
          class="border border-neutral-300 dark:border-neutral-700"
          @change="onLocaleChange"
        >
          <option
            v-for="item in supportedLocales"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2">
        <span>{{ t("app.theme") }}</span>
        <select
          :value="theme.mode"
          class="border border-neutral-300 dark:border-neutral-700"
          @change="onThemeChange"
        >
          <option value="system">{{ t("app.themeSystem") }}</option>
          <option value="light">{{ t("app.themeLight") }}</option>
          <option value="dark">{{ t("app.themeDark") }}</option>
        </select>
      </label>
    </div>
  </header>
</template>
