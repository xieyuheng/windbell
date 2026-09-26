<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { makeDividerState } from "../../components/divider/DividerState"
import ResizeDivider from "../../components/divider/ResizeDivider.vue"
import SessionComposer from "./components/SessionComposer.vue"
import SessionSignList from "./components/SessionSignList.vue"
import SessionToolbar from "./components/SessionToolbar.vue"
import RangerPanel from "../ranger/RangerPanel.vue"
import { sessionMessages } from "./Session.i18n"
import {
  interpretSession,
  loadSessionState,
  makeSessionState,
} from "./SessionState"

function sessionRangerOpenStorageKey(sessionId: string): string {
  return `windbell.session.${sessionId}.rangerOpen`
}

function sessionWidthRatioStorageKey(sessionId: string): string {
  return `windbell.session.${sessionId}.sessionWidthRatio`
}

function sessionRangerLocationStorageKey(sessionId: string): string {
  return `windbell.session.${sessionId}.rangerLocation`
}

function readStoredRangerOpen(sessionId: string): boolean {
  try {
    return (
      localStorage.getItem(sessionRangerOpenStorageKey(sessionId)) === "true"
    )
  } catch {
    return false
  }
}

function writeStoredRangerOpen(sessionId: string, value: boolean): void {
  try {
    localStorage.setItem(sessionRangerOpenStorageKey(sessionId), String(value))
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

const sessionDividerOptions = {
  defaultRatio: 0.6,
  minRatio: 0.4,
  maxRatio: 0.8,
}

const state = makeSessionState(sessionId.value)
const rangerOpen = ref(readStoredRangerOpen(sessionId.value))
const sessionDivider = ref(
  makeDividerState({
    ...sessionDividerOptions,
    storageKey: sessionWidthRatioStorageKey(sessionId.value),
  }),
)
const locationStorageKey = computed(() =>
  sessionRangerLocationStorageKey(sessionId.value),
)
const signList = ref<InstanceType<typeof SessionSignList> | null>(null)
const title = computed(() => state.title || t("notFound"))
const rangerPaneVisible = computed(
  () => rangerOpen.value && state.workspaceId !== "" && !state.loading,
)
const sessionPaneWidth = computed(() =>
  rangerPaneVisible.value ? `${sessionDivider.value.ratio * 100}%` : "100%",
)

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
  await signList.value?.scrollToBottom()
  await interpretSession(state, content)
}

onMounted(async () => {
  await loadSessionState(state, sessionId.value)
  await signList.value?.scrollToBottom()
})

watch(sessionId, async (value) => {
  rangerOpen.value = readStoredRangerOpen(value)
  sessionDivider.value = makeDividerState({
    ...sessionDividerOptions,
    storageKey: sessionWidthRatioStorageKey(value),
  })

  await loadSessionState(state, value)
  await signList.value?.scrollToBottom()
})

watch(rangerOpen, (value) => {
  writeStoredRangerOpen(sessionId.value, value)
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
      class="relative flex min-h-0 min-w-0 shrink-0 flex-col overflow-hidden"
      :style="{ width: sessionPaneWidth }"
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

        <SessionSignList ref="signList" :state="state" />

        <SessionComposer
          v-model="input"
          :interpreting="state.interpreting"
          @send="send"
        />
      </div>
    </section>

    <ResizeDivider v-if="rangerPaneVisible" :state="sessionDivider" />

    <div
      v-if="rangerPaneVisible"
      class="h-screen min-w-0 flex-1 overflow-hidden"
    >
      <RangerPanel
        :workspace-id="state.workspaceId"
        :location-storage-key="locationStorageKey"
      />
    </div>
  </main>
</template>
