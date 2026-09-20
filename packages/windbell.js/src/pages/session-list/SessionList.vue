<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink, useRoute } from "vue-router"
import { mockSessions } from "../../mock/session"
import { mockWorkspaces } from "../../mock/workspace"
import type { Session } from "../../models/Session"
import { sessionListMessages } from "./SessionList.i18n"

const route = useRoute()

const { locale, t } = useI18n({
  messages: sessionListMessages,
  useScope: "local",
})

const workspaceId = computed(() => String(route.params.workspaceId ?? ""))
const workspace = computed(() =>
  mockWorkspaces.find((item) => item.id === workspaceId.value),
)
const sessions = computed(() =>
  mockSessions.filter((session) => session.workspaceId === workspaceId.value),
)

function preview(session: Session): string {
  const sign = session.signs[session.signs.length - 1]
  if (sign === undefined) return ""

  switch (sign.kind) {
    case "UserSign":
    case "AssistantSign":
    case "ToolSign":
    case "SystemSign":
      return sign.content
    case "ErrorSign":
      return sign.message
  }
}

function formatUpdatedAt(value: number): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: "short",
    day: "numeric",
  }).format(value)
}

useHead(() => ({
  title: workspace.value?.name ?? t("title"),
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
    <header
      class="flex flex-col gap-3 border-b border-neutral-200 px-5 py-5 dark:border-neutral-800"
    >
      <RouterLink
        class="text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        :to="{ name: 'workspace-list' }"
      >
        ← {{ t("back") }}
      </RouterLink>

      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">{{ workspace?.name ?? t("title") }}</h1>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          {{ t("description") }}
        </p>
      </div>
    </header>

    <ol v-if="sessions.length > 0" class="flex flex-1 flex-col">
      <li
        v-for="session in sessions"
        :key="session.id"
        class="border-b border-neutral-200 dark:border-neutral-800"
      >
        <RouterLink
          class="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900"
          :to="{
            name: 'session',
            params: { workspaceId: workspaceId, sessionId: session.id },
          }"
        >
          <div class="flex items-baseline justify-between gap-4">
            <h2 class="truncate text-base font-medium">{{ session.title }}</h2>
            <span
              class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
            >
              {{ formatUpdatedAt(session.updatedAt) }}
            </span>
          </div>

          <p
            class="line-clamp-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400"
          >
            {{ preview(session) }}
          </p>

          <p class="text-xs text-neutral-500 dark:text-neutral-500">
            {{ t("signCount", { count: session.signs.length }) }}
          </p>
        </RouterLink>
      </li>
    </ol>

    <div
      v-else
      class="flex flex-1 items-center justify-center px-6 text-sm text-neutral-500"
    >
      {{ t("empty") }}
    </div>

    <footer
      class="sticky bottom-0 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
    >
      <button
        class="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-neutral-100 dark:text-neutral-900"
        type="button"
      >
        {{ t("newSession") }}
      </button>
    </footer>
  </main>
</template>
