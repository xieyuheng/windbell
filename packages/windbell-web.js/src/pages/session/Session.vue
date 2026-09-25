<script setup lang="ts">
import { SendHorizontal } from "@lucide/vue"
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
  <main class="relative flex min-h-0 max-w-4xl flex-1 flex-col overflow-hidden">
    <div class="flex-1 overflow-y-auto px-4 pt-6 pb-19">
      <div class="flex w-full flex-col gap-6">
        <h1 class="text-xl text-ink">
          {{ title }}
        </h1>

        <p v-if="state.loading" class="text-ink">
          {{ t("loading") }}
        </p>

        <p v-else-if="state.error !== undefined" class="text-danger">
          {{ state.error }}
        </p>

        <ol v-else class="flex flex-col gap-4">
          <SignCard
            v-for="(sign, index) in state.context"
            :key="index"
            :sign="sign"
          />
        </ol>
      </div>
    </div>

    <div
      class="pointer-events-none fixed inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] z-10 px-2 py-4 md:absolute md:bottom-0"
    >
      <form
        class="pointer-events-auto flex w-full items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
        @submit.prevent="send"
      >
        <input
          v-model="input"
          class="min-w-0 flex-1 bg-transparent px-4 py-2 text-ink outline-none placeholder:text-ink-muted"
          :placeholder="t('inputPlaceholder')"
          type="text"
        />
        <button
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-deep text-ink transition-colors hover:bg-line disabled:opacity-50"
          type="submit"
          :disabled="state.interpreting"
          :aria-label="state.interpreting ? t('sending') : t('send')"
          :title="state.interpreting ? t('sending') : t('send')"
        >
          <SendHorizontal :size="18" :stroke-width="1.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  </main>
</template>
