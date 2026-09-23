<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
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
  <main class="flex flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-2">
      <p class="font-mono text-sm text-ink">
        {{ state.sessionId }}
      </p>
      <h1 class="text-2xl font-bold text-ink">
        {{ title }}
      </h1>
    </header>

    <SignList :signs="state.context" />
  </main>
</template>
