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
const rangerOpen = ref(readStoredRangerOpen())
const sessionDivider = makeDividerState({
  defaultRatio: 0.6,
  minRatio: 0.4,
  maxRatio: 0.8,
  storageKey: "windbell.session.sessionWidthRatio",
})
const signList = ref<InstanceType<typeof SessionSignList> | null>(null)
const title = computed(() => state.title || t("notFound"))
const sessionPaneWidth = computed(() =>
  rangerOpen.value && state.workspaceId !== ""
    ? `${sessionDivider.ratio * 100}%`
    : "100%",
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
  await loadSessionState(state, value)
  await signList.value?.scrollToBottom()
})

watch(rangerOpen, (value) => {
  writeStoredRangerOpen(value)
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

    <ResizeDivider
      v-if="rangerOpen && state.workspaceId !== ''"
      :state="sessionDivider"
    />

    <div
      v-if="rangerOpen && state.workspaceId !== ''"
      class="h-screen min-w-0 flex-1 overflow-hidden"
    >
      <RangerPanel :workspace-id="state.workspaceId" />
    </div>
  </main>
</template>
