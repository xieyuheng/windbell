<script setup lang="ts">
import type { OpenRouterProviderModelEntry } from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
import { providerMessages } from "./Provider.i18n.ts"

const props = defineProps<{
  entry: OpenRouterProviderModelEntry
}>()

const { t } = useI18n({
  messages: providerMessages,
  useScope: "local",
})

function json(value: unknown): string {
  return JSON.stringify(value, null, 2)
}
</script>

<template>
  <section v-if="entry.info" class="flex flex-col gap-1 text-sm">
    <h3 class="text-base text-ink">
      {{ t("modelInfo") }}
    </h3>

    <dl class="flex flex-col gap-1">
      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("contextLength") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.context_length }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("modality") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.architecture.modality ?? t("none") }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("inputModalities") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.architecture.input_modalities.join(", ") }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("outputModalities") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.architecture.output_modalities.join(", ") }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("supportedParameters") }}</dt>
        <dd class="break-all font-mono text-ink">
          {{ entry.info.supported_parameters.join(", ") }}
        </dd>
      </div>
    </dl>
  </section>

  <section v-if="entry.config" class="flex flex-col gap-1 text-sm">
    <h3 class="text-base text-ink">
      {{ t("config") }}
    </h3>

    <dl class="flex flex-col gap-1">
      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("reasoning") }}</dt>
        <dd>
          <pre
            class="overflow-auto rounded bg-paper-deep p-2 font-mono text-xs text-ink"
            >{{
              entry.config.reasoning ? json(entry.config.reasoning) : t("none")
            }}</pre>
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("provider") }}</dt>
        <dd>
          <pre
            class="overflow-auto rounded bg-paper-deep p-2 font-mono text-xs text-ink"
            >{{
              entry.config.provider ? json(entry.config.provider) : t("none")
            }}</pre>
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink-muted">{{ t("extraBody") }}</dt>
        <dd>
          <pre
            class="overflow-auto rounded bg-paper-deep p-2 font-mono text-xs text-ink"
            >{{
              entry.config.extraBody ? json(entry.config.extraBody) : t("none")
            }}</pre>
        </dd>
      </div>
    </dl>
  </section>
</template>
