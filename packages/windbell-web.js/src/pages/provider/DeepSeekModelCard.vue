<script setup lang="ts">
import type { DeepSeekProviderModelEntry } from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
import Card from "../../components/card/Card.vue"
import { providerMessages } from "./Provider.i18n.ts"

defineProps<{
  entry: DeepSeekProviderModelEntry
}>()

const { t } = useI18n({
  messages: providerMessages,
  useScope: "local",
})
</script>

<template>
  <Card as="article">
    <template #tag>
      <h2 class="break-all font-mono text-sm text-ink">
        {{ entry.name }}
      </h2>
    </template>

    <div class="flex flex-col gap-4 p-2">
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span
          class="rounded px-1.5 py-0.5"
          :class="
            entry.enabled ? 'bg-line text-ink' : 'bg-paper text-ink-muted'
          "
        >
          {{ entry.enabled ? t("enabled") : t("disabled") }}
        </span>

        <span
          v-if="entry.isDefault"
          class="rounded bg-line px-1.5 py-0.5 text-ink"
        >
          {{ t("default") }}
        </span>
      </div>

      <section v-if="entry.info" class="flex flex-col gap-1 text-sm">
        <h3 class="text-base text-ink">
          {{ t("modelInfo") }}
        </h3>

        <dl class="flex flex-col gap-1">
          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("ownedBy") }}</dt>
            <dd class="font-mono text-ink">{{ entry.info.owned_by }}</dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("contextWindow") }}</dt>
            <dd class="font-mono text-ink">{{ entry.info.context_window }}</dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("maxOutputTokens") }}</dt>
            <dd class="font-mono text-ink">
              {{ entry.info.max_output_tokens }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("inputModalities") }}</dt>
            <dd class="font-mono text-ink">
              {{ entry.info.input_modalities.join(", ") }}
            </dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("outputModalities") }}</dt>
            <dd class="font-mono text-ink">
              {{ entry.info.output_modalities.join(", ") }}
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
            <dt class="text-ink-muted">{{ t("thinking") }}</dt>
            <dd class="font-mono text-ink">{{ entry.config.thinking }}</dd>
          </div>

          <div class="flex flex-wrap gap-2">
            <dt class="text-ink-muted">{{ t("reasoningEffort") }}</dt>
            <dd class="font-mono text-ink">
              {{ entry.config.reasoningEffort }}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  </Card>
</template>
