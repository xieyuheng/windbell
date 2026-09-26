<script setup lang="ts">
import { FolderTree, Plus, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import MediumButton from "../../components/buttons/MediumButton.vue"
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
          :to="{
            name: 'ranger',
            params: { workspaceId },
          }"
        >
          <FolderTree :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("ranger") }}</span>
        </MediumButton>

        <MediumButton
          :to="{
            name: 'session-dustbin',
            params: { workspaceId },
          }"
        >
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("sessionDustbin") }}</span>
        </MediumButton>
      </div>
    </header>

    <div class="flex flex-col gap-2">
      <h2 class="text-base text-ink">
        {{ t("sessions") }}
      </h2>

      <MediumButton class="self-start" type="button" @click="createSession">
        <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t("newSession") }}</span>
      </MediumButton>
    </div>

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
  </PageLayout>
</template>
