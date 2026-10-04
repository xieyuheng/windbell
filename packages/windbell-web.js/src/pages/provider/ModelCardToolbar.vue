<script setup lang="ts">
import { Check } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import SmallButton from "../../components/buttons/SmallButton.vue"
import ToggleSwitch from "../../components/toggle/ToggleSwitch.vue"
import { providerMessages } from "./Provider.i18n.ts"

const props = defineProps<{
  enabled: boolean
  isDefault: boolean
  busy: boolean
}>()

const emit = defineEmits<{
  enable: []
  disable: []
  setDefault: []
}>()

const { t } = useI18n({
  messages: providerMessages,
  useScope: "local",
})

function requestToggleEnabled(nextEnabled: boolean): void {
  if (props.busy || nextEnabled === props.enabled) return

  if (nextEnabled) {
    emit("enable")
  } else {
    emit("disable")
  }
}

function requestSetDefault(): void {
  if (!props.enabled || props.isDefault) return

  emit("setDefault")
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 min-h-9">
    <ToggleSwitch
      :model-value="props.enabled"
      :disabled="props.busy"
      @update:model-value="requestToggleEnabled"
    >
      <span class="text-sm">{{ t("enableModel") }}</span>
    </ToggleSwitch>

    <SmallButton
      v-if="props.enabled"
      type="button"
      :disabled="props.busy || props.isDefault"
      @click="requestSetDefault"
    >
      <Check :size="16" :stroke-width="1.5" aria-hidden="true" />
      <span>
        {{ props.isDefault ? t("defaultModel") : t("setAsDefaultModel") }}
      </span>
    </SmallButton>
  </div>
</template>
