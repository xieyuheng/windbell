<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import ModelCard from "./ModelCard.vue"
import { providerMessages } from "./Provider.i18n.ts"
import { loadProviderState, makeProviderState } from "./ProviderState.ts"

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

useHead(() => ({
  title: state.providerConfig?.name ?? providerName,
}))
</script>

<template>
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="break-all text-xl text-ink">
        {{ state.providerConfig?.name ?? providerName }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'provider-list' }" />
      </div>
    </header>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <template v-else>
      <section class="flex flex-col gap-2 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="state.isDefaultProvider"
            class="rounded bg-paper-deep px-2 py-0.5 text-ink"
          >
            {{ t("defaultProvider") }}
          </span>

          <span class="rounded bg-paper-deep px-2 py-0.5 text-ink">
            {{ t("apiKey") }}:
            {{
              state.apiKeyConfigured
                ? t("apiKeyConfigured")
                : t("apiKeyNotConfigured")
            }}
          </span>
        </div>

        <div v-if="state.providerConfig" class="flex flex-wrap gap-2">
          <span class="text-ink-muted">{{ t("baseUrl") }}</span>
          <span class="break-all font-mono text-ink">
            {{ state.providerConfig.baseUrl }}
          </span>
        </div>
      </section>

      <p v-if="state.warning !== undefined" class="text-sm text-ink-muted">
        {{ t("warning") }}: {{ state.warning }}
      </p>

      <section class="flex flex-col gap-4">
        <h2 class="text-base text-ink">
          {{ t("models") }}
        </h2>

        <p v-if="state.models.length === 0" class="text-sm text-ink-muted">
          {{ t("noModels") }}
        </p>

        <ul v-else class="flex flex-col gap-4">
          <li v-for="entry in state.models" :key="entry.name">
            <ModelCard :entry="entry" />
          </li>
        </ul>
      </section>
    </template>
  </PageLayout>
</template>
