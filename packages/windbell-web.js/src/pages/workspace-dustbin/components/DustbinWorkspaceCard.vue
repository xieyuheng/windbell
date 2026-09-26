<script setup lang="ts">
import { ArchiveRestore, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import { workspaceDustbinMessages } from "../WorkspaceDustbin.i18n"

const props = withDefaults(
  defineProps<{
    workspace: S.DustbinWorkspace
    busy?: boolean
  }>(),
  {
    busy: false,
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

    <div class="px-3 py-2">
      <p class="truncate font-mono text-ink">
        {{ workspace.root }}
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
