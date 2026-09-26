<script setup lang="ts">
import { useHead } from "@unhead/vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { useI18n } from "vue-i18n"
import { notFoundPageMessages } from "./NotFoundPage.i18n"
import BackButton from "../../components/buttons/BackButton.vue"

const { t } = useI18n({
  messages: notFoundPageMessages,
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
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">404</h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'home' }" />
      </div>
    </header>
  </PageLayout>
</template>
