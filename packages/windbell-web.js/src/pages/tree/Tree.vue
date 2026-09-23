<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { treeMessages } from "./Tree.i18n"

const { t } = useI18n({
  messages: treeMessages,
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
  <main class="flex flex-1 flex-col gap-3 px-5 py-6">
    <h1 class="text-2xl font-bold text-ink">
      {{ t("title") }}
    </h1>
    <p class="text-sm text-ink">
      {{ t("description") }}
    </p>
  </main>
</template>
