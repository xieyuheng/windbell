<script setup lang="ts">
import { ArrowLeft, FolderTree } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import SignCard from "../../components/sign/SignCard.vue"
import SessionComposer from "./components/SessionComposer.vue"
import RangerPanel from "../ranger/RangerPanel.vue"
import { sessionMessages } from "./Session.i18n"
import {
  interpretSession,
  loadSessionState,
  makeSessionState,
} from "./SessionState"

const rangerOpenStorageKey = "windbell.session.rangerOpen"

function readStoredRangerOpen(): boolean {
  try {
    return localStorage.getItem(rangerOpenStorageKey) === "true"
  } catch {
    return false
  }
}

function writeStoredRangerOpen(value: boolean): void {
  try {
    localStorage.setItem(rangerOpenStorageKey, String(value))
  } catch {
    // ignore storage errors
  }
}

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
const rangerOpen = ref(readStoredRangerOpen())
const title = computed(() => state.title || t("notFound"))

let bottomObserver: IntersectionObserver | undefined

function goBack(): void {
  if (state.workspaceId === "") {
    void router.push({ name: "home" })
    return
  }

  void router.push({
    name: "workspace",
    params: {
      workspaceId: state.workspaceId,
    },
  })
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

  // Wait for a layout pass so sign cards have finished reflowing before
  // measuring scrollHeight. This matters especially when the window width
  // changes and text wraps to a different number of lines.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const element = scroller.value
  if (element === null) return

  element.scrollTop = element.scrollHeight
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

watch(rangerOpen, (value) => {
  writeStoredRangerOpen(value)
})

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
  <main class="flex h-screen w-full overflow-hidden">
    <section
      class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div
        class="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden"
      >
        <button
          type="button"
          class="pointer-events-auto absolute left-2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/60 text-ink-muted backdrop-blur transition-colors hover:text-ink"
          :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
          @click="goBack()"
        >
          <ArrowLeft :size="18" :stroke-width="1.5" aria-hidden="true" />
          <span class="sr-only">{{ t("app.back") }}</span>
        </button>

        <button
          type="button"
          class="pointer-events-auto absolute right-2 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/60 text-ink-muted backdrop-blur transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50"
          :class="rangerOpen ? 'border-ink/40 bg-interactive/60 text-ink' : ''"
          :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
          :aria-pressed="rangerOpen"
          :disabled="state.workspaceId === ''"
          :title="rangerOpen ? t('closeRanger') : t('openRanger')"
          @click="rangerOpen = !rangerOpen"
        >
          <FolderTree :size="18" :stroke-width="1.5" aria-hidden="true" />
          <span class="sr-only">
            {{ rangerOpen ? t("closeRanger") : t("openRanger") }}
          </span>
        </button>

        <div
          ref="scroller"
          class="min-h-0 flex-1 overflow-y-auto px-4 pt-19 pb-19"
        >
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

        <SessionComposer
          v-model="input"
          :interpreting="state.interpreting"
          @send="send"
        />
      </div>
    </section>

    <div
      v-if="rangerOpen && state.workspaceId !== ''"
      class="h-screen w-[48vw] max-w-[720px] shrink-0 border-l border-line"
    >
      <RangerPanel :workspace-id="state.workspaceId" />
    </div>
  </main>
</template>
