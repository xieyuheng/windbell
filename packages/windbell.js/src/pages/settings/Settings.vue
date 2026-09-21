<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { ArrowLeft } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useFont, type Font } from "../../app/font"
import { setLocale, supportedLocales } from "../../app/i18n"
import { useTheme, type ThemeMode } from "../../app/theme"
import { settingsMessages } from "./Settings.i18n"
import { createSettingsState } from "./SettingsState"

const router = useRouter()
const { locale, t } = useI18n({
  messages: settingsMessages,
  useScope: "local",
})
const theme = useTheme()
const font = useFont()
const state = createSettingsState(router)

const themeOptions: Array<{ value: ThemeMode; labelKey: string }> = [
  { value: "system", labelKey: "themeSystem" },
  { value: "light", labelKey: "themeLight" },
  { value: "dark", labelKey: "themeDark" },
]

const fontOptions: Array<{ value: Font; labelKey: string }> = [
  { value: "unifont", labelKey: "fontUnifont" },
  { value: "system", labelKey: "fontSystem" },
]

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <main class="flex flex-1 flex-col gap-8 px-5 py-8">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 self-start text-sm text-ink-muted transition-colors hover:text-ink"
      @click="state.goBack()"
    >
      <ArrowLeft :size="16" :stroke-width="1.5" aria-hidden="true" />
      <span>{{ t("back") }}</span>
    </button>

    <h1 class="text-2xl font-bold text-ink">{{ t("title") }}</h1>

    <section class="flex flex-col gap-6">
      <fieldset class="flex flex-col gap-3">
        <legend class="text-sm font-medium text-ink">
          {{ t("language") }}
        </legend>

        <label
          v-for="item in supportedLocales"
          :key="item.value"
          class="flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            class="accent-ink"
            type="radio"
            name="language"
            :value="item.value"
            :checked="locale === item.value"
            @change="setLocale(item.value)"
          />
          <span>{{ item.label }}</span>
        </label>
      </fieldset>

      <fieldset class="flex flex-col gap-3">
        <legend class="text-sm font-medium text-ink">
          {{ t("theme") }}
        </legend>

        <label
          v-for="item in themeOptions"
          :key="item.value"
          class="flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            class="accent-ink"
            type="radio"
            name="theme"
            :value="item.value"
            :checked="theme.mode === item.value"
            @change="theme.setMode(item.value)"
          />
          <span>{{ t(item.labelKey) }}</span>
        </label>
      </fieldset>

      <fieldset class="flex flex-col gap-3">
        <legend class="text-sm font-medium text-ink">
          {{ t("font") }}
        </legend>

        <label
          v-for="item in fontOptions"
          :key="item.value"
          class="flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            class="accent-ink"
            type="radio"
            name="font"
            :value="item.value"
            :checked="font.name === item.value"
            @change="font.setFont(item.value)"
          />
          <span>{{ t(item.labelKey) }}</span>
        </label>
      </fieldset>
    </section>
  </main>
</template>
