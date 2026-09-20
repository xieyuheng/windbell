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
          class="rounded border border-neutral-300 bg-white px-2 py-1 text-neutral-900 outline-none transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          @change="onLocaleChange"
        >
          <option
            v-for="item in supportedLocales"
            :key="item.value"
            :value="item.value"
            class="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2">
        <span>{{ t("app.theme") }}</span>
        <select
          :value="theme.mode"
          class="rounded border border-neutral-300 bg-white px-2 py-1 text-neutral-900 outline-none transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          @change="onThemeChange"
        >
          <option
            value="system"
            class="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {{ t("app.themeSystem") }}
          </option>
          <option
            value="light"
            class="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {{ t("app.themeLight") }}
          </option>
          <option
            value="dark"
            class="bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
          >
            {{ t("app.themeDark") }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>
