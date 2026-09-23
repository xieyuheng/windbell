<script setup lang="ts">
import { ChevronDown, ChevronRight, Settings } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import type * as S from "@xieyuheng/semiosis.js"
import SessionList from "./SessionList.vue"

defineProps<{
  workspaces: Array<S.Workspace>
  sessions: Array<S.SessionIndex>
  activeWorkspaceId?: S.WorkspaceId | null
  activeSessionId?: S.SessionId | null
  expandedWorkspaceIds: Set<S.WorkspaceId>
}>()

defineEmits<{
  (event: "toggle", workspaceId: S.WorkspaceId): void
  (
    event: "select-session",
    workspaceId: S.WorkspaceId,
    sessionId: S.SessionId,
  ): void
}>()

const { t } = useI18n()
</script>

<template>
  <section class="flex flex-col gap-1 px-3 py-4">
    <div class="flex items-center justify-between px-2">
      <h2 class="text-xs font-medium tracking-wide text-ink">
        {{ t("sidebar.workspaces") }}
      </h2>

      <RouterLink
        class="flex h-5 w-5 items-center justify-center text-ink-muted transition-colors hover:text-ink"
        :to="{ name: 'settings' }"
        :aria-label="t('sidebar.settings')"
        :title="t('sidebar.settings')"
      >
        <Settings :size="14" :stroke-width="1.5" aria-hidden="true" />
      </RouterLink>
    </div>

    <div
      v-for="workspace in workspaces"
      :key="workspace.id"
      class="flex flex-col"
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors"
        :class="
          workspace.id === activeWorkspaceId
            ? 'bg-paper-deep text-ink'
            : 'text-ink hover:bg-paper-deep'
        "
        @click="$emit('toggle', workspace.id)"
      >
        <span
          class="flex w-3 shrink-0 items-center justify-center text-ink-muted"
        >
          <ChevronDown
            v-if="expandedWorkspaceIds.has(workspace.id)"
            :size="14"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          <ChevronRight
            v-else
            :size="14"
            :stroke-width="1.5"
            aria-hidden="true"
          />
        </span>
        <span class="truncate">{{ workspace.name }}</span>
      </button>

      <SessionList
        v-if="expandedWorkspaceIds.has(workspace.id)"
        :sessions="
          sessions.filter((session) => session.workspaceId === workspace.id)
        "
        :active-session-id="activeSessionId"
        @select="
          (sessionId) => $emit('select-session', workspace.id, sessionId)
        "
      />
    </div>
  </section>
</template>
