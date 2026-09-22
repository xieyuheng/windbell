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
    case "AssistantSign":
      return t("signKind.assistant")
    case "ToolSign":
      return t("signKind.tool")
    case "PersonaSign":
      return t("signKind.persona")
    case "ErrorSign":
      return t("signKind.error")
  }
}

function body(sign: Sign): string {
  switch (sign.kind) {
    case "UserSign":
    case "AssistantSign":
    case "ToolSign":
    case "PersonaSign":
      return sign.content
    case "ErrorSign":
      return sign.message
  }
}

function borderClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "border-ink-muted"
    case "AssistantSign":
      return "border-accent"
    case "ToolSign":
      return "border-warning"
    case "PersonaSign":
      return "border-info"
    case "ErrorSign":
      return "border-danger"
  }
}

function textClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "text-ink"
    case "AssistantSign":
      return "text-accent"
    case "ToolSign":
      return "text-warning"
    case "PersonaSign":
      return "text-info"
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

      <details
        v-if="sign.kind === 'AssistantSign' && sign.reasoning !== ''"
        class="mb-3 rounded border border-line bg-paper-deep px-3 py-2"
        open
      >
        <summary class="cursor-pointer text-sm font-medium text-ink">
          {{ t("thinking") }}
        </summary>
        <p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-ink">
          {{ sign.reasoning }}
        </p>
      </details>

      <p class="whitespace-pre-wrap text-sm leading-7 text-ink">
        {{ body(sign) }}
      </p>
    </li>
  </ol>
</template>
