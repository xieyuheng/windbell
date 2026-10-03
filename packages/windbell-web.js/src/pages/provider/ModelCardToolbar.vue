<script setup lang="ts">
import { Check, Power } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import SmallButton from "../../components/buttons/SmallButton.vue"
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

function requestToggleEnabled(): void {
  if (props.enabled) {
    emit("disable")
  } else {
    emit("enable")
  }
}

function requestSetDefault(): void {
  if (!props.enabled || props.isDefault) return

  emit("setDefault")
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <SmallButton type="button" :disabled="busy" @click="requestToggleEnabled">
      <Power :size="16" :stroke-width="1.5" aria-hidden="true" />
      <span>
        {{ enabled ? t("disableModel") : t("enableModel") }}
      </span>
    </SmallButton>

    <SmallButton
      type="button"
      :disabled="busy || !enabled || isDefault"
      @click="requestSetDefault"
    >
      <Check :size="16" :stroke-width="1.5" aria-hidden="true" />
      <span>
        {{ isDefault ? t("defaultModel") : t("setAsDefaultModel") }}
      </span>
    </SmallButton>
  </div>
</template>
