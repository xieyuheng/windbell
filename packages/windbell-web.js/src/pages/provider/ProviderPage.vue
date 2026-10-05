<script setup lang="ts">
import { Check, KeyRound, Trash2 } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import MediumButton from "../../components/buttons/MediumButton.vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import ModelCard from "./ModelCard.vue"
import { providerMessages } from "./Provider.i18n.ts"
import {
  deleteProviderApiKey,
  disableProviderModel,
  enableProviderModel,
  loadProviderState,
  makeProviderState,
  putProviderApiKey,
  selectDefaultProvider,
  setDefaultProviderModel,
} from "./ProviderState.ts"

const route = useRoute()
const providerName = String(route.params.providerName)

const { t } = useI18n({
  messages: providerMessages,
  useScope: "local",
})

const state = makeProviderState(providerName)

onMounted(async () => {
  await loadProviderState(state)
})

async function handleEnableModel(modelName: string): Promise<void> {
  try {
    await enableProviderModel(state, modelName)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handleDisableModel(modelName: string): Promise<void> {
  try {
    await disableProviderModel(state, modelName)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handleSetDefaultModel(modelName: string): Promise<void> {
  try {
    await setDefaultProviderModel(state, modelName)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handleSetDefaultProvider(): Promise<void> {
  if (state.isDefaultProvider) return

  try {
    await selectDefaultProvider(state)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handlePutApiKey(): Promise<void> {
  const key = window.prompt(t("apiKeyPrompt"), "")
  if (key === null) return

  const value = key.trim()
  if (value === "") return

  try {
    await putProviderApiKey(state, value)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handleDeleteApiKey(): Promise<void> {
  if (!window.confirm(t("deleteApiKeyConfirm"))) return

  try {
    await deleteProviderApiKey(state)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

useHead(() => ({
  title: state.providerConfig?.name ?? providerName,
}))
</script>

<template>
  <PageLayout>
    <header class="flex flex-col gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h1 class="break-all text-xl text-ink">
          {{ state.providerConfig?.name ?? providerName }}
        </h1>

        <p
          v-if="state.providerConfig"
          class="truncate font-mono text-sm"
          :title="state.providerConfig.baseUrl"
        >
          {{ state.providerConfig.baseUrl }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'provider-list' }" />

        <template v-if="state.providerConfig">
          <MediumButton
            type="button"
            :disabled="state.isDefaultProvider"
            @click="handleSetDefaultProvider"
          >
            <Check :size="16" :stroke-width="1.5" aria-hidden="true" />
            <span>
              {{
                state.isDefaultProvider
                  ? t("defaultProvider")
                  : t("setAsDefault")
              }}
            </span>
          </MediumButton>

          <template v-if="state.apiKeyConfigured">
            <MediumButton type="button" @click="handlePutApiKey">
              <KeyRound :size="16" :stroke-width="1.5" aria-hidden="true" />
              <span>{{ t("updateApiKey") }}</span>
            </MediumButton>

            <MediumButton type="button" @click="handleDeleteApiKey">
              <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
              <span>{{ t("deleteApiKey") }}</span>
            </MediumButton>
          </template>

          <MediumButton v-else type="button" @click="handlePutApiKey">
            <KeyRound :size="16" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t("configureApiKey") }}</span>
          </MediumButton>
        </template>
      </div>
    </header>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-sign-error">
      {{ state.error }}
    </p>

    <template v-else>
      <p v-if="state.warning !== undefined" class="text-sm text-ink">
        {{ t("warning") }}{{ t("colon") }}{{ state.warning }}
      </p>

      <section class="flex flex-col gap-4">
        <h2 class="text-base text-ink">
          {{ t("models") }}
        </h2>

        <p v-if="state.models.length === 0" class="text-sm text-ink">
          {{ t("noModels") }}
        </p>

        <ul v-else class="flex flex-col gap-4">
          <li v-for="entry in state.models" :key="entry.name">
            <ModelCard
              :entry="entry"
              :busy="state.busyModelNames[entry.name] === true"
              @enable="handleEnableModel(entry.name)"
              @disable="handleDisableModel(entry.name)"
              @set-default="handleSetDefaultModel(entry.name)"
            />
          </li>
        </ul>
      </section>
    </template>
  </PageLayout>
</template>
