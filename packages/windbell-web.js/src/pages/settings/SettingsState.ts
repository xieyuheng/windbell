import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import { reactive } from "vue"
import type { Router } from "vue-router"

export type SettingsState = {
  models: Array<{ qualifiedName: string }>
  defaultModelQualifiedName: string | null
  loading: boolean
  saving: boolean
  error: string | undefined
  goBack(): void
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeSettingsState(router: Router): SettingsState {
  return reactive<SettingsState>({
    models: [],
    defaultModelQualifiedName: null,
    loading: false,
    saving: false,
    error: undefined,

    goBack() {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push({ name: "dashboard" })
      }
    },
  })
}

export async function loadSettings(state: SettingsState): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const [models, settings] = await Promise.all([
      semiosis.models.list(),
      semiosis.settings.get(),
    ])

    state.models = models
    state.defaultModelQualifiedName =
      settings.defaultModel?.qualifiedName ?? null
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function setDefaultModel(
  state: SettingsState,
  qualifiedName: string,
): Promise<void> {
  state.saving = true
  state.error = undefined

  try {
    await semiosis.settings.put({
      defaultModel: {
        qualifiedName,
      },
    })

    state.defaultModelQualifiedName = qualifiedName
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.saving = false
  }
}
