<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import {
  builtInThemes,
  findThemeById,
  isBuiltInTheme,
  setPreviewTheme,
  useTheme,
  type Theme,
  type ThemeColorName,
} from "../../app/theme.ts"
import ColorPicker from "../../components/color-picker/ColorPicker.vue"
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
const route = useRoute()
const router = useRouter()
const themes = useTheme()

const themeId = computed(() => String(route.params.themeId ?? ""))
const isNew = computed(
  () => route.name === "theme-new" || themeId.value === "new",
)
const existingTheme = computed(() => findThemeById(themeId.value))

const draft = reactive<Theme>(makeDraft())
const selectedMode = ref<"light" | "dark">("light")
const saving = ref(false)
const previewing = ref(false)
const error = ref<string | undefined>(undefined)

const colorGroups: Array<{
  labelKey: string
  tokens: Array<ThemeColorName>
}> = [
  {
    labelKey: "baseColors",
    tokens: ["paper", "ink", "line"],
  },
  {
    labelKey: "semanticColors",
    tokens: ["accent", "warning", "info", "danger", "interactive"],
  },
  {
    labelKey: "signColors",
    tokens: [
      "sign-persona",
      "sign-user",
      "sign-reasoning",
      "sign-assistant",
      "sign-provider-data",
      "sign-tool-call",
      "sign-tool",
      "sign-tool-output",
      "sign-error",
    ],
  },
]

function makeDraft(): Theme {
  const theme = isNew.value
    ? builtInThemes[0]!
    : (existingTheme.value ?? builtInThemes[0]!)

  return {
    id: isNew.value ? "" : theme.id,
    name: isNew.value ? "New Theme" : theme.name,
    colors: {
      light: { ...theme.colors.light },
      dark: { ...theme.colors.dark },
    },
  }
}

function cloneDraft(): Theme {
  return {
    id: draft.id,
    name: draft.name,
    colors: {
      light: { ...draft.colors.light },
      dark: { ...draft.colors.dark },
    },
  }
}

function updateColor(
  mode: "light" | "dark",
  token: ThemeColorName,
  value: string,
): void {
  draft.colors[mode][token] = value
  refreshPreview()
}

function refreshPreview(): void {
  if (!previewing.value) return
  setPreviewTheme(cloneDraft())
}

function togglePreview(): void {
  previewing.value = !previewing.value

  if (previewing.value) {
    setPreviewTheme(cloneDraft())
  } else {
    setPreviewTheme(undefined)
  }
}

async function handleSave(): Promise<void> {
  saving.value = true
  error.value = undefined

  try {
    const saved =
      isNew.value || existingTheme.value === undefined
        ? await themes.createCustomTheme({
            name: draft.name,
            colors: cloneDraft().colors,
          })
        : await themes.updateCustomTheme(cloneDraft())

    previewing.value = false
    setPreviewTheme(undefined)
    Object.assign(draft, saved)

    if (isNew.value) {
      await router.replace({
        name: "theme-editor",
        params: { themeId: saved.id },
      })
    }
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  } finally {
    saving.value = false
  }
}

async function handleDelete(): Promise<void> {
  if (isNew.value || existingTheme.value === undefined) return
  if (!window.confirm(t("confirmDelete", { name: draft.name }))) return

  saving.value = true
  error.value = undefined

  try {
    previewing.value = false
    setPreviewTheme(undefined)
    await themes.deleteCustomTheme(draft.id)
    await router.push({ name: "themes" })
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isNew.value) return
  if (existingTheme.value === undefined) {
    void router.replace({ name: "themes" })
    return
  }

  if (isBuiltInTheme(existingTheme.value.id)) {
    void router.replace({ name: "themes" })
  }
})

onBeforeUnmount(() => {
  setPreviewTheme(undefined)
})

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ isNew ? t("newTheme") : t("edit") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'themes' }" />
        <MediumButton :disabled="saving" @click="togglePreview">
          {{ previewing ? t("stopPreview") : t("preview") }}
        </MediumButton>
        <MediumButton :disabled="saving" @click="handleSave">
          {{ t("save") }}
        </MediumButton>
        <SmallButton
          v-if="!isNew"
          :disabled="saving"
          tone="danger"
          @click="handleDelete"
        >
          {{ t("delete") }}
        </SmallButton>
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
        <h2 class="text-ink">{{ t("name") }}</h2>
      </template>

      <div class="p-3">
        <input
          v-model="draft.name"
          class="w-full rounded border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
          type="text"
          @input="refreshPreview"
        />
      </div>
    </Card>

    <Card as="section">
      <template #tag>
        <div class="flex items-center gap-4">
          <button
            class="text-ink"
            :class="selectedMode === 'light' ? 'font-bold' : 'opacity-60'"
            type="button"
            @click="selectedMode = 'light'"
          >
            {{ t("light") }}
          </button>
          <button
            class="text-ink"
            :class="selectedMode === 'dark' ? 'font-bold' : 'opacity-60'"
            type="button"
            @click="selectedMode = 'dark'"
          >
            {{ t("dark") }}
          </button>
        </div>
      </template>

      <div class="flex flex-col gap-6 p-3">
        <section
          v-for="group in colorGroups"
          :key="group.labelKey"
          class="flex flex-col gap-3"
        >
          <h3 class="text-sm font-bold text-ink">
            {{ t(group.labelKey) }}
          </h3>

          <div class="grid gap-4 md:grid-cols-2">
            <div
              v-for="token in group.tokens"
              :key="token"
              class="flex min-w-0 flex-col gap-1 rounded border border-line p-2"
            >
              <span class="font-mono text-xs text-ink">
                --color-{{ token }}
              </span>
              <ColorPicker
                :model-value="draft.colors[selectedMode][token]"
                @update:modelValue="updateColor(selectedMode, token, $event)"
              />
            </div>
          </div>
        </section>
      </div>
    </Card>
  </PageLayout>
</template>
