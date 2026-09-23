<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useFont, type Font } from "../../app/font"
import { setLocale, supportedLocales } from "../../app/i18n"
import { useTheme, type ThemeMode } from "../../app/theme"
import { settingsMessages } from "./Settings.i18n"
import {
  loadSettings,
  makeSettingsState,
  setDefaultModel,
} from "./SettingsState"

const { locale, t } = useI18n({
  messages: settingsMessages,
  useScope: "local",
})
const router = useRouter()
const theme = useTheme()
const font = useFont()
const state = makeSettingsState(router)

const themeOptions: Array<{ value: ThemeMode; labelKey: string }> = [
  { value: "system", labelKey: "themeSystem" },
  { value: "light", labelKey: "themeLight" },
  { value: "dark", labelKey: "themeDark" },
]

const fontOptions: Array<{ value: Font; labelKey: string }> = [
  { value: "unifont", labelKey: "fontUnifont" },
  { value: "system", labelKey: "fontSystem" },
]

onMounted(async () => {
  await loadSettings(state)
})

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <main class="flex flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold text-ink">{{ t("title") }}</h1>
    </header>

    <section class="flex flex-col gap-6">
      <fieldset
        class="flex flex-col gap-3 border-b border-line pb-6 last:border-b-0"
      >
        <legend class="text-sm font-medium text-ink">
          {{ t("defaultModel") }}
        </legend>

        <p v-if="state.loading" class="text-sm text-ink">
          {{ t("loading") }}
        </p>

        <p v-else-if="state.models.length === 0" class="text-sm text-ink-muted">
          {{ t("noModels") }}
        </p>

        <label
          v-for="item in state.models"
          :key="item.qualifiedName"
          class="flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            class="accent-ink"
            type="radio"
            name="default-model"
            :value="item.qualifiedName"
            :checked="state.defaultModelQualifiedName === item.qualifiedName"
            :disabled="state.saving"
            @change="setDefaultModel(state, item.qualifiedName)"
          />
          <span class="font-mono">{{ item.qualifiedName }}</span>
        </label>

        <p v-if="state.error !== undefined" class="text-sm text-danger">
          {{ state.error }}
        </p>
      </fieldset>

      <fieldset
        class="flex flex-col gap-3 border-b border-line pb-6 last:border-b-0"
      >
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

      <fieldset
        class="flex flex-col gap-3 border-b border-line pb-6 last:border-b-0"
      >
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

      <fieldset
        class="flex flex-col gap-3 border-b border-line pb-6 last:border-b-0"
      >
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
