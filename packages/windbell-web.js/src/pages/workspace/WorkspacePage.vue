<script setup lang="ts">
import { Plus, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink, useRoute, useRouter } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import SessionCard from "./components/SessionCard.vue"
import { workspaceMessages } from "./Workspace.i18n"
import {
  loadWorkspaceState,
  makeSession,
  makeWorkspaceState,
  trashSession,
  updateSessionTitle,
} from "./WorkspaceState"

const route = useRoute()
const router = useRouter()

const { t } = useI18n({
  messages: workspaceMessages,
  useScope: "local",
})

const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const state = makeWorkspaceState(workspaceId.value)
const title = computed(() => state.workspace?.name ?? t("title"))

async function createSession(): Promise<void> {
  try {
    const session = await makeSession(state, t("untitled"))

    await router.push({
      name: "session",
      params: {
        sessionId: session.id,
      },
    })
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
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
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ title }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'dashboard' }" />

        <button
          class="inline-flex items-center gap-2 rounded border-2 border-line px-2 py-1.5 text-ink transition-colors hover:bg-line"
          type="button"
          @click="createSession"
        >
          <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("newSession") }}</span>
        </button>

        <RouterLink
          class="inline-flex items-center gap-2 rounded border-2 border-line px-2 py-1.5 text-ink transition-colors hover:bg-line"
          :to="{
            name: 'session-dustbin',
            params: { workspaceId },
          }"
        >
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("sessionDustbin") }}</span>
        </RouterLink>
      </div>
    </header>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
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
  </main>
</template>
