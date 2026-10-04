import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import { reactive } from "vue"

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

export type ProviderModelLine = {
  name: string
  enabled: boolean
  isDefault: boolean
}

export type ProviderSummary = {
  name: string
  baseUrl: string
  defaultModel: string | null
  apiKeyConfigured: boolean
  isDefaultProvider: boolean
  models: Array<ProviderModelLine>
}

export type ProviderListState = {
  loading: boolean
  error: string | undefined
  providers: Array<ProviderSummary>
}

export function makeProviderListState(): ProviderListState {
  return reactive<ProviderListState>({
    loading: false,
    error: undefined,
    providers: [],
  })
}

export async function loadProviderListState(
  state: ProviderListState,
): Promise<void> {
  state.loading = true
  state.error = undefined

  try {
    const [providerConfigs, settings] = await Promise.all([
      semiosis.providers.list(),
      semiosis.settings.get(),
    ])

    state.providers = await Promise.all(
      providerConfigs.map(async (providerConfig) => {
        const [apiKeyStatus, models] = await Promise.all([
          semiosis.providers.getApiKeyStatus(providerConfig.name),
          semiosis.providers.listModels({ providerName: providerConfig.name }),
        ])

        return {
          name: providerConfig.name,
          baseUrl: providerConfig.baseUrl,
          defaultModel: providerConfig.defaultModel,
          apiKeyConfigured: apiKeyStatus.configured,
          isDefaultProvider: settings.defaultProvider === providerConfig.name,
          models: models.map((model) => ({
            name: model.name,
            enabled: model.enabled,
            isDefault: providerConfig.defaultModel === model.name,
          })),
        }
      }),
    )
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    state.loading = false
  }
}

export async function selectDefaultProvider(
  state: ProviderListState,
  providerName: string,
): Promise<void> {
  await semiosis.settings.put({
    defaultProvider: providerName,
  })

  for (const provider of state.providers) {
    provider.isDefaultProvider = provider.name === providerName
  }
}

export async function putProviderApiKey(
  state: ProviderListState,
  providerName: string,
  key: string,
): Promise<void> {
  await semiosis.providers.putApiKey({ providerName, key })

  const provider = state.providers.find((item) => item.name === providerName)
  if (provider !== undefined) {
    provider.apiKeyConfigured = true
  }
}

export async function deleteProviderApiKey(
  state: ProviderListState,
  providerName: string,
): Promise<void> {
  await semiosis.providers.deleteApiKey(providerName)

  const provider = state.providers.find((item) => item.name === providerName)
  if (provider !== undefined) {
    provider.apiKeyConfigured = false
  }
}
