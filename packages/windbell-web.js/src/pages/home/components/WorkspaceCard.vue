<script setup lang="ts">
import { Pencil, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import { homeMessages } from "../Home.i18n"

const props = withDefaults(
  defineProps<{
    workspace: S.Workspace
    sessions: Array<S.SessionIndex>
    previewLimit?: number
  }>(),
  {
    previewLimit: 3,
  },
)

const emit = defineEmits<{
  updateTitle: [title: string]
  trash: []
}>()

const { t } = useI18n({
  messages: homeMessages,
  useScope: "local",
})

const sessionListRoute = computed(() => ({
  name: "workspace",
  params: {
    workspaceId: props.workspace.id,
  },
}))

const sortedSessions = computed(() =>
  [...props.sessions].sort(
    (a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt,
  ),
)

const previewSessions = computed(() =>
  sortedSessions.value.slice(0, Math.max(0, props.previewLimit)),
)

const latestUpdatedAt = computed(() => {
  const latestSession = sortedSessions.value[0]
  if (latestSession === undefined) return undefined

  return formatDateTime(latestSession.updatedAt)
})

function formatDateTime(value: number): string {
  const date = new Date(value)
  const pad = (value: number): string => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function requestEditTitle(): void {
  const title = window.prompt(t("editTitlePrompt"), props.workspace.name)
  if (title === null) return

  const nextTitle = title.trim()
  if (nextTitle === "" || nextTitle === props.workspace.name) return

  emit("updateTitle", nextTitle)
}

function requestTrash(): void {
  if (!window.confirm(t("trashConfirm"))) return

  emit("trash")
}
</script>

<template>
  <Card as="article">
    <template #header>
      <RouterLink class="block min-w-0" :to="sessionListRoute">
        <h2 class="truncate text-base text-ink">
          {{ workspace.name }}
        </h2>
      </RouterLink>

      <p
        class="mt-1 truncate font-mono text-sm text-ink"
        :title="workspace.root"
      >
        {{ workspace.root }}
      </p>

      <div class="mt-2 flex items-center gap-2">
        <SmallButton type="button" @click="requestEditTitle">
          <Pencil :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("editTitle") }}</span>
        </SmallButton>

        <SmallButton type="button" tone="danger" @click="requestTrash">
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("trash") }}</span>
        </SmallButton>
      </div>
    </template>

    <div class="flex flex-col gap-2 px-3 py-2">
      <RouterLink class="block min-w-0" :to="sessionListRoute">
        <div
          class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm"
        >
          <span>{{ t("sessionCount", { count: sessions.length }) }}</span>
          <span
            v-if="latestUpdatedAt !== undefined"
            class="truncate text-ink/70"
          >
            {{ t("lastActiveAt", { time: latestUpdatedAt }) }}
          </span>
        </div>
      </RouterLink>

      <ul v-if="previewSessions.length > 0" class="flex flex-col gap-1">
        <li v-for="session in previewSessions" :key="session.id">
          <RouterLink
            class="flex min-w-0 items-baseline justify-between gap-3 rounded px-1 py-0.5 text-sm hover:bg-ink/5"
            :to="{ name: 'session', params: { sessionId: session.id } }"
          >
            <span class="truncate">{{ session.title }}</span>
            <span class="shrink-0 text-xs text-ink/60">
              {{ formatDateTime(session.updatedAt) }}
            </span>
          </RouterLink>
        </li>
      </ul>

      <p v-else class="text-sm text-ink/70">
        {{ t("noSessions") }}
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-1 text-sm">
        <p class="truncate">
          {{ t("updatedAt") }} {{ formatDateTime(workspace.updatedAt) }}
        </p>
        <p class="truncate">
          {{ t("createdAt") }} {{ formatDateTime(workspace.createdAt) }}
        </p>
      </div>
    </template>
  </Card>
</template>
