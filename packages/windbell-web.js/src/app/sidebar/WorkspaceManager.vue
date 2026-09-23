<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { mockSessions } from "../../mock/session"
import { mockWorkspaces } from "../../mock/workspace"
import type * as S from "@xieyuheng/semiosis.js"
import WorkspaceList from "./WorkspaceList.vue"

const route = useRoute()
const router = useRouter()

const activeWorkspaceId = computed(() => String(route.params.workspaceId ?? ""))
const activeSessionId = computed(() => String(route.params.sessionId ?? ""))
const expandedWorkspaceIds = ref(new Set<S.WorkspaceId>())

watch(
  activeWorkspaceId,
  (workspaceId) => {
    if (workspaceId === "") return
    const next = new Set(expandedWorkspaceIds.value)
    next.add(workspaceId)
    expandedWorkspaceIds.value = next
  },
  { immediate: true },
)

function toggleWorkspace(workspaceId: S.WorkspaceId): void {
  const next = new Set(expandedWorkspaceIds.value)
  if (next.has(workspaceId)) {
    next.delete(workspaceId)
  } else {
    next.add(workspaceId)
  }
  expandedWorkspaceIds.value = next
}

function selectSession(
  workspaceId: S.WorkspaceId,
  sessionId: S.SessionId,
): void {
  router.push({
    name: "session",
    params: {
      workspaceId,
      sessionId,
    },
  })
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <WorkspaceList
      :workspaces="mockWorkspaces"
      :sessions="mockSessions"
      :active-workspace-id="activeWorkspaceId"
      :active-session-id="activeSessionId"
      :expanded-workspace-ids="expandedWorkspaceIds"
      @toggle="toggleWorkspace"
      @select-session="selectSession"
    />
  </div>
</template>
