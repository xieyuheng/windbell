<script setup lang="ts">
import type { Sign } from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
import { sessionMessages } from "../Session.i18n"

defineProps<{
  signs: Array<Sign>
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

function kindLabel(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return t("signKind.user")
    case "ReasoningSign":
      return t("signKind.reasoning")
    case "AssistantSign":
      return t("signKind.assistant")
    case "ToolCallSign":
      return t("signKind.toolCall")
    case "ToolSign":
      return t("signKind.tool")
    case "ToolOutputSign":
      return t("signKind.toolOutput")
    case "PersonaSign":
      return t("signKind.persona")
    case "ErrorSign":
      return t("signKind.error")
  }
}

function body(sign: Sign): string {
  switch (sign.kind) {
    case "UserSign":
    case "ReasoningSign":
    case "AssistantSign":
    case "ToolOutputSign":
    case "PersonaSign":
      return sign.content
    case "ToolCallSign":
      return `${sign.toolCall.name} ${sign.toolCall.arguments}`
    case "ToolSign":
      return sign.name
    case "ErrorSign":
      return sign.message
  }
}

function borderClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "border-ink-muted"
    case "ReasoningSign":
    case "AssistantSign":
      return "border-accent"
    case "ToolCallSign":
    case "ToolSign":
    case "PersonaSign":
      return "border-info"
    case "ToolOutputSign":
      return "border-warning"
    case "ErrorSign":
      return "border-danger"
  }
}

function textClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "text-ink"
    case "ReasoningSign":
    case "AssistantSign":
      return "text-accent"
    case "ToolCallSign":
    case "ToolSign":
    case "PersonaSign":
      return "text-info"
    case "ToolOutputSign":
      return "text-warning"
    case "ErrorSign":
      return "text-danger"
  }
}
</script>

<template>
  <ol class="flex flex-col gap-4">
    <li
      v-for="(sign, index) in signs"
      :key="index"
      class="border-l-2 pl-4"
      :class="borderClass(sign.kind)"
    >
      <p
        class="mb-1 text-sm font-medium tracking-wide"
        :class="textClass(sign.kind)"
      >
        {{ kindLabel(sign.kind) }}
      </p>

      <p class="whitespace-pre-wrap text-sm leading-7 text-ink">
        {{ body(sign) }}
      </p>
    </li>
  </ol>
</template>
