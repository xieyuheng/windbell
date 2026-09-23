<script setup lang="ts">
import { Plus } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink, useRoute, useRouter } from "vue-router"
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
        workspaceId: state.workspaceId,
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
  <main class="flex flex-1 flex-col">
    <header class="flex flex-col gap-2 border-b border-line px-5 py-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold text-ink">
          {{ title }}
        </h1>
        <p class="text-sm text-ink">
          {{ t("description") }}
        </p>
      </div>
    </header>

    <p v-if="state.loading" class="px-5 py-4 text-sm text-ink">
      {{ t("loading") }}
    </p>

    <p
      v-else-if="state.error !== undefined"
      class="px-5 py-4 text-sm text-danger"
    >
      {{ state.error }}
    </p>

    <ol v-else-if="state.sessions.length > 0" class="flex flex-1 flex-col">
      <li
        v-for="session in state.sessions"
        :key="session.id"
        class="border-b border-line"
      >
        <RouterLink
          class="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-paper-deep"
          :to="{
            name: 'session',
            params: {
              workspaceId: state.workspaceId,
              sessionId: session.id,
            },
          }"
        >
          <div class="flex items-baseline justify-between gap-4">
            <h2 class="truncate text-base font-medium text-ink">
              {{ session.title }}
            </h2>
            <span class="shrink-0 text-sm text-ink">
              {{ formatUpdatedAt(session.updatedAt) }}
            </span>
          </div>
        </RouterLink>
      </li>
    </ol>

    <div
      v-else
      class="flex flex-1 items-center justify-center px-6 text-sm text-ink"
    >
      {{ t("empty") }}
    </div>

    <footer class="sticky bottom-0 border-t border-line bg-paper p-4">
      <button
        class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-80"
        type="button"
        @click="createSession"
      >
        <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t("newSession") }}</span>
      </button>
    </footer>
  </main>
</template>
