<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
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
const signList = ref<InstanceType<typeof SessionSignList> | null>(null)
const title = computed(() => state.title || t("notFound"))

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

        <SessionSignList ref="signList" :state="state" />

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
