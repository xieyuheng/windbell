<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { sessionMessages } from "../Session.i18n"
import { signCardConfig } from "./SignCard.config"

const props = defineProps<{
  sign: S.Sign
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const config = computed(() => signCardConfig[props.sign.kind])

function body(sign: S.Sign): string {
  switch (sign.kind) {
    case "UserSign":
    case "ReasoningSign":
    case "AssistantSign":
    case "ToolOutputSign":
    case "PersonaSign":
      return sign.content
    case "ToolCallSign":
      return `${sign.name} ${sign.arguments}`
    case "ToolSign":
      return sign.name
    case "ErrorSign":
      return sign.message
  }
}
</script>

<template>
  <li class="border-3 rounded" :class="config.border">
    <p class="mb-1 tracking-wide px-3 py-2" :class="config.bg">
      {{ t(config.labelKey) }}
    </p>

    <p class="whitespace-pre-wrap leading-7 px-3 py-2">
      {{ body(sign) }}
    </p>
  </li>
</template>
