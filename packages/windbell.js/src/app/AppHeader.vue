<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { setLocale, supportedLocales, type Locale } from "./i18n"
import { useTheme, type ThemeMode } from "./theme"

defineProps<{
  compact?: boolean
}>()

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
    class="flex items-center justify-between border-b border-line py-3"
    :class="compact ? 'px-4' : 'px-5'"
  >
    <span class="font-semibold text-ink">{{ t("app.name") }}</span>

    <div class="flex items-center text-sm" :class="compact ? 'gap-2' : 'gap-4'">
      <label class="flex items-center gap-2">
        <span v-if="!compact">{{ t("app.language") }}</span>
        <select
          :value="locale"
          class="rounded border border-line bg-paper px-2 py-1 text-ink outline-none transition-colors"
          @change="onLocaleChange"
        >
          <option
            v-for="item in supportedLocales"
            :key="item.value"
            :value="item.value"
            class="bg-paper text-ink"
          >
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-2">
        <span v-if="!compact">{{ t("app.theme") }}</span>
        <select
          :value="theme.mode"
          class="rounded border border-line bg-paper px-2 py-1 text-ink outline-none transition-colors"
          @change="onThemeChange"
        >
          <option value="system" class="bg-paper text-ink">
            {{ t("app.themeSystem") }}
          </option>
          <option value="light" class="bg-paper text-ink">
            {{ t("app.themeLight") }}
          </option>
          <option value="dark" class="bg-paper text-ink">
            {{ t("app.themeDark") }}
          </option>
        </select>
      </label>
    </div>
  </header>
</template>
