<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { sessionListMessages } from "./SessionList.i18n"

const { t } = useI18n({
  messages: sessionListMessages,
  useScope: "local",
})

useHead(() => ({
  title: t("title"),
  meta: [
    {
      name: "description",
      content: t("description"),
    },
  ],
}))
</script>

<template>
  <main class="flex flex-1 flex-col items-center justify-center gap-3 px-6">
    <h1 class="text-2xl font-bold">{{ t("title") }}</h1>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">
      {{ t("description") }}
    </p>
  </main>
</template>
