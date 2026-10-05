<script setup lang="ts">
import { Pencil, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import MediumButton from "../../components/buttons/MediumButton.vue"
import { sendSessionMessage } from "../session/SessionInbox.ts"
import SessionCard from "./SessionCard.vue"
import SessionStartComposer from "./SessionStartComposer.vue"
import { workspaceMessages } from "./Workspace.i18n.ts"
import {
  loadWorkspaceState,
  makeSession,
  makeWorkspaceState,
  trashSession,
  trashWorkspace,
  updateSessionTitle,
  updateWorkspaceTitle,
} from "./WorkspaceState.ts"

const route = useRoute()
const router = useRouter()

const { t } = useI18n({
  messages: workspaceMessages,
  useScope: "local",
})

const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const state = makeWorkspaceState(workspaceId.value)
const title = computed(() => state.workspace?.name ?? t("title"))
const creatingSession = ref(false)

async function createSession(content: string): Promise<void> {
  creatingSession.value = true

  try {
    const session = await makeSession(state, t("untitled"))

    sendSessionMessage({
      kind: "PendingInterpret",
      sessionId: session.id,
      content,
      generateTitle: true,
    })

    await router.push({
      name: "session",
      params: {
        sessionId: session.id,
      },
    })
  } finally {
    creatingSession.value = false
  }
}

async function handleTrashSession(session: S.Session): Promise<void> {
  try {
    await trashSession(state, session.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function editSessionTitle(
  session: S.Session,
  title: string,
): Promise<void> {
  try {
    await updateSessionTitle(state, session.id, title)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function requestEditWorkspaceTitle(): Promise<void> {
  const workspace = state.workspace
  if (workspace === undefined) return

  const nextTitle = window.prompt(t("editTitlePrompt"), workspace.name)
  if (nextTitle === null) return

  const value = nextTitle.trim()
  if (value === "" || value === workspace.name) return

  try {
    await updateWorkspaceTitle(state, value)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function requestTrashWorkspace(): Promise<void> {
  if (!window.confirm(t("trashWorkspaceConfirm"))) return

  try {
    await trashWorkspace(state)
    await router.push({ name: "home" })
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

onMounted(async () => {
  await loadWorkspaceState(state)
})

watch(workspaceId, async (value) => {
  state.workspaceId = value
  await loadWorkspaceState(state)
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
  <PageLayout>
    <header class="flex flex-col gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <h1 class="text-xl text-ink">
          {{ title }}
        </h1>

        <p
          v-if="state.workspace"
          class="truncate font-mono text-sm"
          :title="state.workspace.root"
        >
          {{ state.workspace.root }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'home' }" />

        <MediumButton
          v-if="state.workspace"
          type="button"
          @click="requestEditWorkspaceTitle"
        >
          <Pencil :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("editTitle") }}</span>
        </MediumButton>

        <MediumButton
          v-if="state.workspace"
          type="button"
          @click="requestTrashWorkspace"
        >
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("trashWorkspace") }}</span>
        </MediumButton>
      </div>
    </header>

    <div class="flex flex-col gap-2">
      <h2 class="text-base text-ink">
        {{ t("sessions") }}
      </h2>

      <MediumButton
        class="self-start"
        :to="{
          name: 'session-dustbin',
          params: { workspaceId },
        }"
      >
        <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t("sessionDustbin") }}</span>
      </MediumButton>
    </div>

    <SessionStartComposer :creating="creatingSession" @create="createSession" />

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-sign-error">
      {{ state.error }}
    </p>

    <ol
      v-else-if="state.sessions.length > 0"
      class="flex flex-1 flex-col gap-4"
    >
      <li v-for="session in state.sessions" :key="session.id">
        <SessionCard
          :session="session"
          :previewLimit="5"
          @trash="handleTrashSession(session)"
          @update-title="editSessionTitle(session, $event)"
        />
      </li>
    </ol>

    <div v-else class="flex flex-1 items-center justify-center text-ink">
      {{ t("empty") }}
    </div>
  </PageLayout>
</template>
