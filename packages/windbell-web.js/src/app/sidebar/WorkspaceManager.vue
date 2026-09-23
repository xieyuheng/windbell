<script setup lang="ts">
import { makeSemiosisClient } from "@xieyuheng/semiosis-api.js/client"
import type * as S from "@xieyuheng/semiosis.js"
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import WorkspaceList from "./WorkspaceList.vue"

const semiosis = makeSemiosisClient({
  baseUrl: "/api/semiosis",
})

const route = useRoute()
const router = useRouter()

const activeSessionId = computed(() => String(route.params.sessionId ?? ""))
const expandedWorkspaceIds = ref(new Set<S.WorkspaceId>())
const workspaces = ref<Array<S.Workspace>>([])
const sessions = ref<Array<S.SessionIndex>>([])
const error = ref<string | undefined>(undefined)

const activeWorkspaceId = computed(() => {
  const workspaceId = route.params.workspaceId
  if (workspaceId !== undefined) {
    return String(workspaceId)
  }

  const session = sessions.value.find(
    (session) => session.id === activeSessionId.value,
  )

  return session?.workspaceId ?? ""
})

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

onMounted(async () => {
  try {
    const [nextWorkspaces, nextSessions] = await Promise.all([
      semiosis.workspaces.list(),
      semiosis.sessions.list({
        workspaceId: undefined,
      }),
    ])

    workspaces.value = nextWorkspaces
    sessions.value = nextSessions
  } catch (errorValue) {
    error.value =
      errorValue instanceof Error ? errorValue.message : String(errorValue)
  }
})

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
  _workspaceId: S.WorkspaceId,
  sessionId: S.SessionId,
): void {
  router.push({
    name: "session",
    params: {
      sessionId,
    },
  })
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <p v-if="error !== undefined" class="px-3 py-2 text-sm text-danger">
      {{ error }}
    </p>

    <WorkspaceList
      :workspaces="workspaces"
      :sessions="sessions"
      :active-workspace-id="activeWorkspaceId"
      :active-session-id="activeSessionId"
      :expanded-workspace-ids="expandedWorkspaceIds"
      @toggle="toggleWorkspace"
      @select-session="selectSession"
    />
  </div>
</template>
