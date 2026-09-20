<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import { mockSessions } from "../../mock/session"
import { workspaceListMessages } from "./WorkspaceList.i18n"
import { createWorkspaceListState } from "./WorkspaceListState"

const { t } = useI18n({
  messages: workspaceListMessages,
  useScope: "local",
})

const state = createWorkspaceListState()

function sessionCount(workspaceId: string): number {
  return mockSessions.filter((session) => session.workspaceId === workspaceId)
    .length
}

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
  <main class="flex flex-1 flex-col gap-6 px-5 py-8">
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">{{ t("title") }}</h1>
      <p class="text-sm text-neutral-600 dark:text-neutral-400">
        {{ t("description") }}
      </p>
    </header>

    <ul class="flex flex-col gap-3">
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <RouterLink
          class="flex flex-col gap-3 rounded-2xl border border-neutral-200 px-4 py-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
          :to="{ name: 'session-list', params: { workspaceId: workspace.id } }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h2 class="truncate text-base font-semibold">
                {{ workspace.name }}
              </h2>
              <p
                class="mt-1 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400"
              >
                {{ workspace.root }}
              </p>
            </div>

            <span
              class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
            >
              {{ t("sessionCount", { count: sessionCount(workspace.id) }) }}
            </span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
