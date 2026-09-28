<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { RouterLink, RouterView } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { markdownMessages } from "./Markdown.i18n"

const { t } = useI18n({
  messages: markdownMessages,
  useScope: "local",
})

const tabs = [
  { name: "markdown-upload", label: "upload" },
  { name: "markdown-render", label: "render" },
  { name: "markdown-tree", label: "tree" },
]

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">{{ t("title") }}</h1>
      <div>
        <BackButton :to="{ name: 'home' }" />
      </div>
    </header>

    <nav class="flex flex-wrap gap-2 border-b border-line pb-2">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="{ name: tab.name }"
        class="rounded px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink"
        active-class="bg-paper-deep text-ink"
      >
        {{ t(tab.label) }}
      </RouterLink>
    </nav>

    <RouterView />
  </PageLayout>
</template>
