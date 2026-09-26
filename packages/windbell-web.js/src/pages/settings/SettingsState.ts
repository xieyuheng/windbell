import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import { reactive } from "vue"

export type SettingsState = {
  models: Array<{ qualifiedName: string }>
  defaultModelQualifiedName: string | null
  loading: boolean
  saving: boolean
  error: string | undefined
}

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export function makeSettingsState(): SettingsState {
  return reactive<SettingsState>({
    models: [],
    defaultModelQualifiedName: null,
    loading: false,
    saving: false,
    error: undefined,
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
