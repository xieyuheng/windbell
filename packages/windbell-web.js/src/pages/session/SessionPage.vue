<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import SignCard from "../../components/sign/SignCard.vue"
import SessionComposer from "./components/SessionComposer.vue"
import SessionToolbar from "./components/SessionToolbar.vue"
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
        <SessionToolbar
          :state="state"
          :ranger-open="rangerOpen"
          @back="goBack"
          @toggle-ranger="rangerOpen = !rangerOpen"
        />

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
