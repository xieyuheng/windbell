<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import DustbinSessionCard from "./components/DustbinSessionCard.vue"
import { sessionDustbinMessages } from "./SessionDustbin.i18n"
import {
  loadSessionDustbin,
  makeSessionDustbinState,
  removeSession,
  restoreSession,
  type SessionDustbinListItem,
} from "./SessionDustbinState"

const route = useRoute()

const { t } = useI18n({
  messages: sessionDustbinMessages,
  useScope: "local",
})

const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const state = makeSessionDustbinState(workspaceId.value)
const busySessionId = ref<string | undefined>(undefined)

async function restore(session: SessionDustbinListItem): Promise<void> {
  busySessionId.value = session.id
  state.error = undefined

  try {
    await restoreSession(state, session.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    busySessionId.value = undefined
  }
}

async function remove(session: SessionDustbinListItem): Promise<void> {
  busySessionId.value = session.id
  state.error = undefined

  try {
    await removeSession(state, session.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    busySessionId.value = undefined
  }
}

onMounted(async () => {
  await loadSessionDustbin(state)
})

watch(workspaceId, async (value) => {
  state.workspaceId = value
  await loadSessionDustbin(state)
})

useHead(() => ({
  title: t("title"),
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
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton
          :to="{
            name: 'workspace',
            params: { workspaceId },
          }"
        />
      </div>
    </header>

    <h2 class="text-base text-ink">
      {{ t("deletedSessions") }}
    </h2>

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
        <DustbinSessionCard
          :session="session"
          :busy="busySessionId === session.id"
          @restore="restore(session)"
          @remove="remove(session)"
        />
      </li>
    </ol>

    <div v-else class="flex flex-1 items-center justify-center text-ink">
      {{ t("empty") }}
    </div>
  </main>
</template>
