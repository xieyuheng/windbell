<script setup lang="ts">
import { ArchiveRestore, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import SignLine from "../../../components/sign/SignLine.vue"
import { sessionDustbinMessages } from "../SessionDustbin.i18n"
import type { SessionDustbinListItem } from "../SessionDustbinState"

const props = withDefaults(
  defineProps<{
    session: SessionDustbinListItem
    busy?: boolean
    previewLimit?: number
  }>(),
  {
    busy: false,
    previewLimit: 5,
  },
)

const emit = defineEmits<{
  restore: []
  remove: []
}>()

const { t } = useI18n({
  messages: sessionDustbinMessages,
  useScope: "local",
})

const previewSigns = computed(() => {
  const signs = props.session.context
  const limit = Math.max(0, props.previewLimit)

  return signs.slice(Math.max(0, signs.length - limit))
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
        {{ session.title }}
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

    <div class="flex flex-col gap-2 px-3 py-2">
      <ol v-if="previewSigns.length > 0" class="flex flex-col gap-1">
        <SignLine
          v-for="(sign, index) in previewSigns"
          :key="index"
          :sign="sign"
        />
      </ol>
    </div>

    <template #footer>
      <div class="flex flex-col gap-1 text-sm">
        <p class="truncate">
          {{ t("deletedAt") }} {{ formatDateTime(session.deletedAt) }}
        </p>
        <p class="truncate">
          {{ t("createdAt") }} {{ formatDateTime(session.createdAt) }}
        </p>
      </div>
    </template>
  </Card>
</template>
