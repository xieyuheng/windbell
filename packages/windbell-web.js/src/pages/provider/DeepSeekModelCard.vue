<script setup lang="ts">
import type { DeepSeekProviderModelEntry } from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
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
  <section v-if="entry.info" class="flex flex-col gap-1 text-sm">
    <h3 class="text-base text-ink">
      {{ t("modelInfo") }}
    </h3>

    <dl class="flex flex-col gap-1">
      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("ownedBy") }}</dt>
        <dd class="font-mono text-ink">{{ entry.info.owned_by }}</dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("contextWindow") }}</dt>
        <dd class="font-mono text-ink">{{ entry.info.context_window }}</dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("maxOutputTokens") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.max_output_tokens }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("inputModalities") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.info.input_modalities.join(", ") }}
        </dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("outputModalities") }}</dt>
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
        <dt class="text-ink">{{ t("thinking") }}</dt>
        <dd class="font-mono text-ink">{{ entry.config.thinking }}</dd>
      </div>

      <div class="flex flex-wrap gap-2">
        <dt class="text-ink">{{ t("reasoningEffort") }}</dt>
        <dd class="font-mono text-ink">
          {{ entry.config.reasoningEffort }}
        </dd>
      </div>
    </dl>
  </section>
</template>
