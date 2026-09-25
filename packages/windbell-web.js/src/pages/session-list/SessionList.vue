<script setup lang="ts">
import { Plus } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink, useRoute, useRouter } from "vue-router"
import BaseCard from "../../components/BaseCard.vue"
import Toolbar from "../../components/Toolbar.vue"
import { sessionListMessages } from "./SessionList.i18n"
import {
  loadSessionList,
  makeSession,
  makeSessionListState,
} from "./SessionListState"

const route = useRoute()
const router = useRouter()

const { locale, t } = useI18n({
  messages: sessionListMessages,
  useScope: "local",
})

const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const state = makeSessionListState(workspaceId.value)
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

function formatUpdatedAt(value: number): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: "short",
    day: "numeric",
  }).format(value)
}

onMounted(async () => {
  await loadSessionList(state)
})

watch(workspaceId, async (value) => {
  state.workspaceId = value
  await loadSessionList(state)
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
        <Toolbar />
      </div>
    </header>

    <BaseCard as="section">
      <template #header>
        <h2 class="text-ink">
          {{ t("newSession") }}
        </h2>
      </template>

      <div class="p-2">
        <button
          class="inline-flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-ink transition-colors hover:bg-paper-deep"
          type="button"
          @click="createSession"
        >
          <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("create") }}</span>
        </button>
      </div>
    </BaseCard>

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
        <BaseCard
          :as="RouterLink"
          class="transition-colors hover:border-ink-muted"
          :to="{
            name: 'session',
            params: {
              sessionId: session.id,
            },
          }"
        >
          <template #header>
            <h2 class="truncate text-base text-ink">
              {{ session.title }}
            </h2>
          </template>

          <div class="px-3 py-2">
            <p class="truncate text-ink">
              {{ formatUpdatedAt(session.updatedAt) }}
            </p>
          </div>
        </BaseCard>
      </li>
    </ol>

    <div v-else class="flex flex-1 items-center justify-center text-ink">
      {{ t("empty") }}
    </div>
  </main>
</template>
