<script setup lang="ts">
import { ArrowLeft, ArrowUp, Square } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import SignCard from "../../components/sign/SignCard.vue"
import { sessionMessages } from "./Session.i18n"
import {
  interpretSession,
  loadSessionState,
  makeSessionState,
} from "./SessionState"

const route = useRoute()
const router = useRouter()
const sessionId = computed(() => String(route.params.sessionId ?? ""))
const input = ref("")

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const state = makeSessionState(sessionId.value)
const scroller = ref<HTMLElement | null>(null)
const bottomAnchor = ref<HTMLElement | null>(null)
const bottomAnchorVisible = ref(true)
const title = computed(() => state.title || t("notFound"))

let bottomObserver: IntersectionObserver | undefined

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: "workspace-list" })
  }
}

async function send(): Promise<void> {
  const content = input.value.trim()
  if (content === "" || state.interpreting) return

  input.value = ""
  await scrollToBottom()
  await interpretSession(state, content)
}

async function scrollToBottom(): Promise<void> {
  await nextTick()

  const element = scroller.value
  if (element !== null && element.scrollHeight > element.clientHeight) {
    element.scrollTop = element.scrollHeight
    return
  }

  window.scrollTo({ top: document.documentElement.scrollHeight })
}

function scheduleAutoScroll(): void {
  if (!bottomAnchorVisible.value) return

  void scrollToBottom()
}

onMounted(async () => {
  if (bottomAnchor.value !== null) {
    bottomObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry !== undefined) {
        bottomAnchorVisible.value = entry.isIntersecting
      }
    })
    bottomObserver.observe(bottomAnchor.value)
  }

  await loadSessionState(state, sessionId.value)
  await scrollToBottom()
})

watch(sessionId, async (value) => {
  await loadSessionState(state, value)
  await scrollToBottom()
})

watch(
  () => state.context.length,
  () => {
    scheduleAutoScroll()
  },
)

onBeforeUnmount(() => {
  bottomObserver?.disconnect()
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
  <main
    class="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden"
  >
    <div
      class="shrink-0"
      :style="{ height: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }"
    />

    <div
      class="pointer-events-none fixed inset-x-0 z-50 mx-auto max-w-4xl px-2"
      :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
    >
      <button
        type="button"
        class="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/70 text-ink-muted backdrop-blur transition-colors hover:text-ink"
        @click="goBack()"
      >
        <ArrowLeft :size="18" :stroke-width="1.5" aria-hidden="true" />
        <span class="sr-only">{{ t("app.back") }}</span>
      </button>
    </div>

    <div ref="scroller" class="flex-1 overflow-y-auto px-4 pt-6 pb-19">
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

      <div ref="bottomAnchor" class="h-px w-full" />
    </div>

    <div
      class="pointer-events-none fixed inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] z-10 mx-auto max-w-4xl px-2 py-4"
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
          class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-interactive/60 text-ink transition-transform duration-150 hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
          type="submit"
          :disabled="state.interpreting"
          :aria-label="state.interpreting ? t('sending') : t('send')"
          :title="state.interpreting ? t('sending') : t('send')"
        >
          <Square
            v-if="state.interpreting"
            :size="12"
            class="fill-current"
            aria-hidden="true"
          />

          <ArrowUp v-else :size="18" :stroke-width="1.5" aria-hidden="true" />
        </button>
      </form>
    </div>
  </main>
</template>
