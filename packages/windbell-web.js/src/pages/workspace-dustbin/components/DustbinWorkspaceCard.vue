<script setup lang="ts">
import { ArchiveRestore, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import { workspaceDustbinMessages } from "../WorkspaceDustbin.i18n"

const props = withDefaults(
  defineProps<{
    workspace: S.DustbinWorkspace
    sessions: Array<S.DustbinSessionIndex>
    busy?: boolean
    previewLimit?: number
  }>(),
  {
    busy: false,
    previewLimit: 3,
  },
)

const emit = defineEmits<{
  restore: []
  remove: []
}>()

const { t } = useI18n({
  messages: workspaceDustbinMessages,
  useScope: "local",
})

const sortedSessions = computed(() =>
  [...props.sessions].sort((a, b) => b.deletedAt - a.deletedAt),
)

const previewSessions = computed(() =>
  sortedSessions.value.slice(0, Math.max(0, props.previewLimit)),
)

function formatDateTime(value: number): string {
  const date = new Date(value)
  const pad = (value: number): string => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function requestRemove(): void {
  if (!window.confirm(t("deleteConfirm"))) return

  emit("remove")
}
</script>

<template>
  <Card as="article">
    <template #header>
      <h2 class="truncate text-base text-ink">
        {{ workspace.name }}
      </h2>

      <p
        class="mt-1 truncate font-mono text-sm text-ink"
        :title="workspace.root"
      >
        {{ workspace.root }}
      </p>

      <div class="mt-2 flex items-center gap-2">
        <SmallButton type="button" :disabled="busy" @click="emit('restore')">
          <ArchiveRestore :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("restore") }}</span>
        </SmallButton>

        <SmallButton
          type="button"
          tone="danger"
          :disabled="busy"
          @click="requestRemove"
        >
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("remove") }}</span>
        </SmallButton>
      </div>
    </template>

    <div class="flex flex-col gap-2 px-3 py-2">
      <p class="text-sm">
        {{ t("sessionCount", { count: sessions.length }) }}
      </p>

      <ul v-if="previewSessions.length > 0" class="flex flex-col gap-1">
        <li
          v-for="session in previewSessions"
          :key="session.id"
          class="truncate text-sm text-ink/80"
        >
          {{ session.title }}
        </li>
      </ul>

      <p v-else class="text-sm text-ink/70">
        {{ t("noSessions") }}
      </p>

      <p v-if="sessions.length > 0" class="text-sm text-ink/70">
        {{ t("restoreHint") }}
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-1 text-sm">
        <p class="truncate">
          {{ t("deletedAt") }} {{ formatDateTime(workspace.deletedAt) }}
        </p>
        <p class="truncate">
          {{ t("createdAt") }} {{ formatDateTime(workspace.createdAt) }}
        </p>
      </div>
    </template>
  </Card>
</template>
