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
    case "SystemSign":
      return t("signKind.system")
    case "ErrorSign":
      return t("signKind.error")
  }
}

function body(sign: Sign): string {
  switch (sign.kind) {
    case "UserSign":
    case "AssistantSign":
    case "ToolSign":
    case "SystemSign":
      return sign.content
    case "ErrorSign":
      return sign.message
  }
}

function borderClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "border-neutral-400"
    case "AssistantSign":
      return "border-emerald-500"
    case "ToolSign":
      return "border-amber-500"
    case "SystemSign":
      return "border-sky-500"
    case "ErrorSign":
      return "border-red-500"
  }
}

function textClass(kind: Sign["kind"]): string {
  switch (kind) {
    case "UserSign":
      return "text-neutral-500"
    case "AssistantSign":
      return "text-emerald-600 dark:text-emerald-400"
    case "ToolSign":
      return "text-amber-600 dark:text-amber-400"
    case "SystemSign":
      return "text-sky-600 dark:text-sky-400"
    case "ErrorSign":
      return "text-red-600 dark:text-red-400"
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
      <p class="mb-1 text-xs tracking-wide" :class="textClass(sign.kind)">
        {{ kindLabel(sign.kind) }}
      </p>
      <p
        class="whitespace-pre-wrap text-sm leading-7 text-neutral-700 dark:text-neutral-300"
      >
        {{ body(sign) }}
      </p>
    </li>
  </ol>
</template>
