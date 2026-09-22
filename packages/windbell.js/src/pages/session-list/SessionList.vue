<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { Plus } from "@lucide/vue"
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
    case "ToolOutputSign":
    case "PersonaSign":
      return sign.content
    case "ToolSign":
      return sign.name
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
    <header class="flex flex-col gap-2 border-b border-line px-5 py-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold text-ink">
          {{ workspace?.name ?? t("title") }}
        </h1>
        <p class="text-sm text-ink">
          {{ t("description") }}
        </p>
      </div>
    </header>

    <ol v-if="sessions.length > 0" class="flex flex-1 flex-col">
      <li
        v-for="session in sessions"
        :key="session.id"
        class="border-b border-line"
      >
        <RouterLink
          class="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-paper-deep"
          :to="{
            name: 'session',
            params: { workspaceId: workspaceId, sessionId: session.id },
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

          <p class="line-clamp-2 text-sm leading-7 text-ink">
            {{ preview(session) }}
          </p>

          <p class="text-sm text-ink">
            {{ t("signCount", { count: session.signs.length }) }}
          </p>
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
      >
        <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t("newSession") }}</span>
      </button>
    </footer>
  </main>
</template>
