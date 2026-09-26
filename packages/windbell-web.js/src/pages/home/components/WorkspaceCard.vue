<script setup lang="ts">
import { Pencil, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import { homeMessages } from "../Home.i18n"

const props = defineProps<{
  workspace: S.Workspace
}>()

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

    <RouterLink class="block" :to="sessionListRoute">
      <div class="px-3 py-2">
        <p class="truncate font-mono text-ink">
          {{ workspace.root }}
        </p>
      </div>
    </RouterLink>

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
