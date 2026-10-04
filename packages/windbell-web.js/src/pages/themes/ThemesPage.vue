<script setup lang="ts">
import { Plus } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import { useTheme, type Theme, type ThemeColorName } from "../../app/theme.ts"
import BackButton from "../../components/buttons/BackButton.vue"
import MediumButton from "../../components/buttons/MediumButton.vue"
import SmallButton from "../../components/buttons/SmallButton.vue"
import Card from "../../components/card/Card.vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { themesMessages } from "./Themes.i18n.ts"

const { t } = useI18n({
  messages: themesMessages,
  useScope: "local",
})
const router = useRouter()
const {
  state,
  activeTheme,
  builtInThemes,
  activateTheme,
  createCustomTheme,
  deleteCustomTheme,
} = useTheme()

const error = ref<string | undefined>(undefined)
const swatchTokens: Array<ThemeColorName> = [
  "paper",
  "paper-deep",
  "ink",
  "accent",
  "danger",
]

const themeModes = ["light", "dark"] as const

async function handleActivate(theme: Theme): Promise<void> {
  error.value = undefined

  try {
    await activateTheme(theme.id)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  }
}

async function handleDuplicate(theme: Theme): Promise<void> {
  error.value = undefined

  try {
    const created = await createCustomTheme({
      name: `${theme.name} Copy`,
      colors: {
        light: { ...theme.colors.light },
        dark: { ...theme.colors.dark },
      },
    })

    await router.push({
      name: "theme-editor",
      params: { themeId: created.id },
    })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  }
}

async function handleDelete(theme: Theme): Promise<void> {
  if (!window.confirm(t("confirmDelete", { name: theme.name }))) return

  error.value = undefined

  try {
    await deleteCustomTheme(theme.id)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  }
}

function openNewTheme(): void {
  void router.push({
    name: "theme-editor",
    params: { themeId: "new" },
  })
}

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'settings' }" />
        <MediumButton @click="openNewTheme">
          <Plus class="h-4 w-4" />
          <span>{{ t("newTheme") }}</span>
        </MediumButton>
      </div>
    </header>

    <p
      v-if="error"
      class="rounded border border-danger/60 px-3 py-2 text-sm text-danger"
    >
      {{ error }}
    </p>

    <Card as="section">
      <template #tag>
        <h2 class="text-ink">{{ t("builtInThemes") }}</h2>
      </template>

      <div class="flex flex-col gap-3 p-3">
        <article
          v-for="theme in builtInThemes"
          :key="theme.id"
          class="flex flex-col gap-3 rounded border border-line p-3"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-ink">{{ theme.name }}</span>
              <span
                class="rounded border border-line px-1 text-xs text-ink-muted"
              >
                {{ t("sourceBuiltIn") }}
              </span>
              <span
                v-if="activeTheme.id === theme.id"
                class="rounded bg-ink px-1 text-xs text-paper"
              >
                {{ t("active") }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <MediumButton
                :disabled="activeTheme.id === theme.id"
                @click="handleActivate(theme)"
              >
                {{ t("use") }}
              </MediumButton>
              <SmallButton @click="handleDuplicate(theme)">
                {{ t("duplicate") }}
              </SmallButton>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="mode in themeModes"
              :key="mode"
              class="flex overflow-hidden rounded border border-line"
            >
              <span
                v-for="token in swatchTokens"
                :key="token"
                class="h-6 flex-1"
                :style="{ backgroundColor: theme.colors[mode][token] }"
              />
            </div>
          </div>
        </article>
      </div>
    </Card>

    <Card as="section">
      <template #tag>
        <h2 class="text-ink">{{ t("customThemes") }}</h2>
      </template>

      <div class="flex flex-col gap-3 p-3">
        <p
          v-if="state.customThemes.length === 0"
          class="text-sm text-ink-muted"
        >
          {{ t("noCustomThemes") }}
        </p>

        <article
          v-for="theme in state.customThemes"
          :key="theme.id"
          class="flex flex-col gap-3 rounded border border-line p-3"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="text-ink">{{ theme.name }}</span>
              <span
                class="rounded border border-line px-1 text-xs text-ink-muted"
              >
                {{ t("sourceCustom") }}
              </span>
              <span
                v-if="activeTheme.id === theme.id"
                class="rounded bg-ink px-1 text-xs text-paper"
              >
                {{ t("active") }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <MediumButton
                :disabled="activeTheme.id === theme.id"
                @click="handleActivate(theme)"
              >
                {{ t("use") }}
              </MediumButton>
              <MediumButton
                :to="{ name: 'theme-editor', params: { themeId: theme.id } }"
              >
                {{ t("edit") }}
              </MediumButton>
              <SmallButton tone="danger" @click="handleDelete(theme)">
                {{ t("delete") }}
              </SmallButton>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="mode in themeModes"
              :key="mode"
              class="flex overflow-hidden rounded border border-line"
            >
              <span
                v-for="token in swatchTokens"
                :key="token"
                class="h-6 flex-1"
                :style="{ backgroundColor: theme.colors[mode][token] }"
              />
            </div>
          </div>
        </article>
      </div>
    </Card>
  </PageLayout>
</template>
