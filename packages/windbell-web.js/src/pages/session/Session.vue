<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import SignCard from "./components/SignCard.vue"
import { sessionMessages } from "./Session.i18n"
import {
  interpretSession,
  loadSessionState,
  makeSessionState,
} from "./SessionState"

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId ?? ""))
const input = ref("")

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const state = makeSessionState(sessionId.value)
const title = computed(() => state.title || t("notFound"))

async function send(): Promise<void> {
  const content = input.value.trim()
  if (content === "" || state.interpreting) return

  input.value = ""
  await interpretSession(state, content)
}

onMounted(async () => {
  await loadSessionState(state, sessionId.value)
})

watch(sessionId, async (value) => {
  await loadSessionState(state, value)
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

    <p v-if="state.loading" class="text-sm text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-sm text-danger">
      {{ state.error }}
    </p>

    <ol v-else class="flex flex-col gap-4">
      <SignCard
        v-for="(sign, index) in state.context"
        :key="index"
        :sign="sign"
      />
    </ol>

    <form class="flex gap-2" @submit.prevent="send">
      <input
        v-model="input"
        class="flex-1 rounded border border-line bg-transparent px-3 py-2 text-sm text-ink outline-none"
        :placeholder="t('inputPlaceholder')"
        type="text"
      />
      <button
        class="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        type="submit"
        :disabled="state.interpreting"
      >
        {{ state.interpreting ? t("sending") : t("send") }}
      </button>
    </form>
  </main>
</template>
