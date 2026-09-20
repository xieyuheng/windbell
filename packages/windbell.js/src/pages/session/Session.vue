<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink, useRoute } from "vue-router"
import SignList from "./components/SignList.vue"
import { sessionMessages } from "./Session.i18n"
import { createSessionState, loadSessionState } from "./SessionState"

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId ?? ""))

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const state = createSessionState(sessionId.value)
const title = computed(() => state.title || t("notFound"))

watch(sessionId, (value) => {
  loadSessionState(state, value)
})

useHead(() => ({
  title: title.value,
  meta: [
    {
      name: "description",
      content: t("description"),
    },
  ],
}))
</script>

<template>
  <main class="flex flex-1 flex-col gap-6 px-6 py-8">
    <header class="flex flex-col gap-3">
      <RouterLink
        class="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        :to="{
          name: 'session-list',
          params: { workspaceId: String(route.params.workspaceId ?? '') },
        }"
      >
        ← {{ t("back") }}
      </RouterLink>

      <p class="font-mono text-sm text-black dark:text-white">
        {{ state.sessionId }}
      </p>
      <h1 class="text-2xl font-bold text-black dark:text-white">
        {{ title }}
      </h1>
    </header>

    <SignList :signs="state.signs" />
  </main>
</template>
