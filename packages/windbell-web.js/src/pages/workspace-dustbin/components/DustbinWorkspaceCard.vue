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

const { locale, t } = useI18n({
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

const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>()

function getRelativeTimeFormatter(locale: string): Intl.RelativeTimeFormat {
  const existing = relativeTimeFormatters.get(locale)
  if (existing !== undefined) return existing

  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  })
  relativeTimeFormatters.set(locale, formatter)
  return formatter
}

type RelativeTimeUnit = "minute" | "hour" | "day" | "week" | "month" | "year"

function formatRelativeUnit(
  formatter: Intl.RelativeTimeFormat,
  locale: string,
  value: number,
  unit: RelativeTimeUnit,
): string {
  const text = formatter.format(value, unit)
  if (!locale.startsWith("zh")) return text

  return text.replace(/(\d)(?=[\u4e00-\u9fff])/g, "$1 ")
}

function formatRelativeTime(value: number, locale: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - value) / 1000))

  if (seconds < 60) return t("justNow")

  const formatter = getRelativeTimeFormatter(locale)

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return formatRelativeUnit(formatter, locale, -minutes, "minute")
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return formatRelativeUnit(formatter, locale, -hours, "hour")
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return formatRelativeUnit(formatter, locale, -days, "day")
  }

  if (days < 30) {
    const weeks = Math.max(1, Math.floor(days / 7))
    return formatRelativeUnit(formatter, locale, -weeks, "week")
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return formatRelativeUnit(formatter, locale, -months, "month")
  }

  const years = Math.max(1, Math.floor(months / 12))
  return formatRelativeUnit(formatter, locale, -years, "year")
}

function formatSessionRelativeTime(value: number): string {
  return formatRelativeTime(value, locale.value)
}

function requestRemove(): void {
  if (!window.confirm(t("deleteConfirm"))) return

  emit("remove")
}
</script>

<template>
  <Card as="article">
    <template #header>
      <h2 class="truncate text-lg">
        {{ workspace.name }}
      </h2>

      <p class="mt-1 truncate font-mono text-sm" :title="workspace.root">
        {{ workspace.root }}
      </p>

      <div class="mt-2 flex items-center gap-2">
        <SmallButton
          type="button"
          :disabled="busy"
          :title="t('restoreHint')"
          @click="emit('restore')"
        >
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

    <div class="flex flex-col px-3 py-2">
      <ul v-if="previewSessions.length > 0" class="flex flex-col gap-1">
        <li
          v-for="session in previewSessions"
          :key="session.id"
          class="flex min-w-0 items-baseline justify-between"
        >
          <span class="truncate">{{ session.title }}</span>
          <span
            class="shrink-0 text-xs text-ink/60"
            :title="formatDateTime(session.deletedAt)"
          >
            {{ formatSessionRelativeTime(session.deletedAt) }}
          </span>
        </li>
      </ul>

      <p v-else class="text-sm text-ink/70">
        {{ t("noSessions") }}
      </p>
    </div>

    <template #footer>
      <div class="flex flex-col gap-1 text-sm">
        <p class="truncate">{{ t("sessionCount") }} {{ sessions.length }}</p>
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
