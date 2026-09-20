<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import type { Workspace, WorkspaceId } from "../../models/Workspace"
import type { Session, SessionId } from "../../models/Session"
import SessionList from "./SessionList.vue"

defineProps<{
  workspaces: Array<Workspace>
  sessions: Array<Session>
  activeWorkspaceId?: WorkspaceId | null
  activeSessionId?: SessionId | null
  expandedWorkspaceIds: Set<WorkspaceId>
}>()

defineEmits<{
  (event: "toggle", workspaceId: WorkspaceId): void
  (
    event: "select-session",
    workspaceId: WorkspaceId,
    sessionId: SessionId,
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
        class="text-xs text-ink-muted transition-colors hover:text-ink"
        :to="{ name: 'settings' }"
        :title="t('sidebar.settings')"
      >
        ⚙
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
        <span class="w-3 text-xs text-ink-muted">
          {{ expandedWorkspaceIds.has(workspace.id) ? "▾" : "▸" }}
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
