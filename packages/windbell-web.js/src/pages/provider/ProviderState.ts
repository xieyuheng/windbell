import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { reactive } from "vue"

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export type ProviderState = {
  providerName: string
  loading: boolean
  error: string | undefined
  warning: string | undefined
  providerConfig: S.ProviderConfig | undefined
  apiKeyConfigured: boolean
  isDefaultProvider: boolean
  busyModelNames: Record<string, boolean>
  models: Array<S.ProviderModelEntry>
}

export function makeProviderState(providerName: string): ProviderState {
  return reactive<ProviderState>({
    providerName,
    loading: false,
    error: undefined,
    warning: undefined,
    providerConfig: undefined,
    apiKeyConfigured: false,
    isDefaultProvider: false,
    busyModelNames: {},
    models: [],
  })
}

export async function loadProviderState(state: ProviderState): Promise<void> {
  state.loading = true
  state.error = undefined
  state.warning = undefined

  try {
    const [providerConfigs, settings, apiKeyStatus, localModels] =
      await Promise.all([
        semiosis.providers.list(),
        semiosis.settings.get(),
        semiosis.providers.getApiKeyStatus(state.providerName),
        semiosis.providers.listModels({ providerName: state.providerName }),
      ])

    const providerConfig = providerConfigs.find(
      (providerConfig) => providerConfig.name === state.providerName,
    )

    if (providerConfig === undefined) {
      throw new Error(`provider not found: ${state.providerName}`)
    }

    state.providerConfig = providerConfig
    state.apiKeyConfigured = apiKeyStatus.configured
    state.isDefaultProvider = settings.defaultProvider === state.providerName
    state.models = localModels

    if (apiKeyStatus.configured) {
      try {
        state.models = await semiosis.providers.listModels({
          providerName: state.providerName,
          all: true,
        })
      } catch (error) {
        state.warning = error instanceof Error ? error.message : String(error)
      }
    } else {
      state.warning = "api key is not configured; showing local models only"
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function enableProviderModel(
  state: ProviderState,
  modelName: string,
): Promise<void> {
  if (state.busyModelNames[modelName] === true) return

  state.busyModelNames[modelName] = true

  try {
    await semiosis.providers.enableModel({
      providerName: state.providerName,
      modelName,
    })
    await refreshProviderModels(state)
  } finally {
    delete state.busyModelNames[modelName]
  }
}

export async function disableProviderModel(
  state: ProviderState,
  modelName: string,
): Promise<void> {
  if (state.busyModelNames[modelName] === true) return

  state.busyModelNames[modelName] = true

  try {
    await semiosis.providers.disableModel({
      providerName: state.providerName,
      modelName,
    })
    await refreshProviderModels(state)
  } finally {
    delete state.busyModelNames[modelName]
  }
}

export async function setDefaultProviderModel(
  state: ProviderState,
  modelName: string,
): Promise<void> {
  if (state.busyModelNames[modelName] === true) return

  state.busyModelNames[modelName] = true

  try {
    await semiosis.providers.setDefaultModel({
      providerName: state.providerName,
      modelName,
    })

    for (const entry of state.models) {
      entry.isDefault = entry.name === modelName
    }
  } finally {
    delete state.busyModelNames[modelName]
  }
}

async function refreshProviderModels(state: ProviderState): Promise<void> {
  const localModels = await semiosis.providers.listModels({
    providerName: state.providerName,
  })

  if (!state.apiKeyConfigured) {
    state.models = localModels
    return
  }

  try {
    state.models = await semiosis.providers.listModels({
      providerName: state.providerName,
      all: true,
    })
  } catch (error) {
    state.models = localModels
    state.warning = error instanceof Error ? error.message : String(error)
  }
}
