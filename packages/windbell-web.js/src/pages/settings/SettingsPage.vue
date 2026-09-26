<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import MediumButton from "../../components/buttons/MediumButton.vue"
import Card from "../../components/card/Card.vue"
import BackButton from "../../components/buttons/BackButton.vue"
import { useFont, type Font } from "../../app/font"
import { setLocale, supportedLocales } from "../../app/i18n"
import { useTheme, type ThemeMode } from "../../app/theme"
import { settingsMessages } from "./Settings.i18n"
import {
  loadSettings,
  makeSettingsState,
  setDefaultModel,
} from "./SettingsState"
import {
  clearStorageKeys,
  clearWindbellStorage,
  readWindbellStorage,
  type StorageGroup,
} from "./SettingsStorage"

const { locale, t } = useI18n({
  messages: settingsMessages,
  useScope: "local",
})
const theme = useTheme()
const font = useFont()
const state = makeSettingsState()
const storageEntries = ref(readWindbellStorage())
const storageGroupLabelKeys: Record<StorageGroup, string> = {
  app: "storageApp",
  ranger: "storageRanger",
  session: "storageSession",
  other: "storageOther",
}
const storageGroups = computed(() => {
  const order: Array<StorageGroup> = ["app", "ranger", "session", "other"]

  return order
    .map((id) => {
      const entries = storageEntries.value.filter((entry) => entry.group === id)

      return {
        id,
        labelKey: storageGroupLabelKeys[id],
        count: entries.length,
        bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
      }
    })
    .filter((group) => group.count > 0)
})
const storageTotalBytes = computed(() =>
  storageEntries.value.reduce((sum, entry) => sum + entry.bytes, 0),
)
const hasSessionStorage = computed(() =>
  storageEntries.value.some((entry) => entry.group === "session"),
)

function refreshStorage(): void {
  storageEntries.value = readWindbellStorage()
}

function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  return `${(bytes / 1024).toFixed(1)} KB`
}

function clearSessionStorage(): void {
  if (!window.confirm(t("confirmClearSession"))) return

  clearStorageKeys(
    storageEntries.value
      .filter((entry) => entry.group === "session")
      .map((entry) => entry.key),
  )
  refreshStorage()
}

function clearAllStorage(): void {
  if (!window.confirm(t("confirmClearAllWindbell"))) return

  clearWindbellStorage()
  refreshStorage()
}

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
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'home' }" />
      </div>
    </header>

    <div class="flex flex-col gap-4">
      <Card as="section">
        <template #header>
          <h2 class="text-ink">
            {{ t("language") }}
          </h2>
        </template>

        <div class="flex flex-col gap-1 p-2">
          <label
            v-for="item in supportedLocales"
            :key="item.value"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
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
        </div>
      </Card>

      <Card as="section">
        <template #header>
          <h2 class="text-ink">
            {{ t("theme") }}
          </h2>
        </template>

        <div class="flex flex-col gap-1 p-2">
          <label
            v-for="item in themeOptions"
            :key="item.value"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
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
        </div>
      </Card>

      <Card as="section">
        <template #header>
          <h2 class="text-ink">
            {{ t("font") }}
          </h2>
        </template>

        <div class="flex flex-col gap-1 p-2">
          <label
            v-for="item in fontOptions"
            :key="item.value"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
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
        </div>
      </Card>

      <Card as="section">
        <template #header>
          <h2 class="text-ink">
            {{ t("defaultModel") }}
          </h2>
        </template>

        <div class="flex flex-col gap-1 p-2">
          <p v-if="state.loading" class="px-2 py-1.5 text-ink">
            {{ t("loading") }}
          </p>

          <p
            v-else-if="state.models.length === 0"
            class="px-2 py-1.5 text-ink-muted"
          >
            {{ t("noModels") }}
          </p>

          <label
            v-for="item in state.models"
            :key="item.qualifiedName"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
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

          <p v-if="state.error !== undefined" class="px-2 py-1.5 text-danger">
            {{ state.error }}
          </p>
        </div>
      </Card>

      <Card as="section">
        <template #header>
          <h2 class="text-ink">
            {{ t("browserData") }}
          </h2>
        </template>

        <div class="flex flex-col gap-3 p-2">
          <p class="px-2 text-sm text-ink-muted">
            {{ t("browserDataDescription") }}
          </p>

          <p v-if="storageEntries.length === 0" class="px-2 py-1.5 text-ink">
            {{ t("storageEmpty") }}
          </p>

          <template v-else>
            <p class="px-2 text-sm text-ink-muted">
              {{
                t("storageSummary", {
                  count: storageEntries.length,
                  size: formatStorageBytes(storageTotalBytes),
                })
              }}
            </p>

            <dl class="flex flex-col gap-1 px-2">
              <div
                v-for="group in storageGroups"
                :key="group.id"
                class="flex items-center justify-between gap-3 text-sm"
              >
                <dt class="text-ink">{{ t(group.labelKey) }}</dt>
                <dd class="text-ink-muted">
                  {{ group.count }} · {{ formatStorageBytes(group.bytes) }}
                </dd>
              </div>
            </dl>

            <details class="px-2">
              <summary
                class="cursor-pointer text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {{ t("showRawStorage") }}
              </summary>

              <ul
                class="mt-2 flex max-h-64 flex-col gap-2 overflow-auto rounded border border-line/60 p-2"
              >
                <li
                  v-for="entry in storageEntries"
                  :key="entry.key"
                  class="flex flex-col gap-1"
                >
                  <code class="break-all font-mono text-xs text-ink">
                    {{ entry.key }}
                  </code>
                  <code class="break-all font-mono text-xs text-ink-muted">
                    {{ entry.value }}
                  </code>
                </li>
              </ul>
            </details>

            <div class="flex flex-wrap items-center gap-2 px-2">
              <MediumButton
                v-if="hasSessionStorage"
                type="button"
                @click="clearSessionStorage"
              >
                {{ t("clearSessionData") }}
              </MediumButton>

              <MediumButton
                type="button"
                tone="danger"
                @click="clearAllStorage"
              >
                {{ t("clearAllWindbellData") }}
              </MediumButton>
            </div>
          </template>
        </div>
      </Card>
    </div>
  </main>
</template>
