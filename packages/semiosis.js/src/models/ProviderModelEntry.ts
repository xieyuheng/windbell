import type * as DeepSeek from "../providers/deepseek/index.ts"
import type * as OpenRouter from "../providers/openrouter/index.ts"

export type ProviderModelInfo = DeepSeek.ModelInfo | OpenRouter.ModelInfo

export type ProviderModelEntryOf<
  ProviderName extends string,
  Config,
  Info = unknown,
> = {
  providerName: ProviderName
  name: string
  pinned: boolean
  isDefault: boolean
  config: Config | null
  info: Info | null
}

export type DeepSeekProviderModelEntry = ProviderModelEntryOf<
  "deepseek",
  DeepSeek.ModelConfig,
  DeepSeek.ModelInfo
>

export type OpenRouterProviderModelEntry = ProviderModelEntryOf<
  "openrouter",
  OpenRouter.ModelConfig,
  OpenRouter.ModelInfo
>

export type ProviderModelEntry =
  DeepSeekProviderModelEntry | OpenRouterProviderModelEntry
