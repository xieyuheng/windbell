<script setup lang="ts">
import { Pencil, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import Card from "../../../components/card/Card.vue"
import SmallButton from "../../../components/buttons/SmallButton.vue"
import SignLine from "../../../components/sign/SignLine.vue"

const props = withDefaults(
  defineProps<{
    session: S.Session
    previewLimit?: number
  }>(),
  {
    previewLimit: 3,
  },
)

const emit = defineEmits<{
  trash: []
  updateTitle: [title: string]
}>()

const { t } = useI18n({
  messages: {
    "zh-CN": {
      updatedAt: "更新于：",
      createdAt: "创建于：",
      editTitle: "修改标题",
      trash: "移入回收站",
      editTitlePrompt: "输入新的对话标题",
      trashConfirm: "确定将这个对话移入回收站吗？之后可以从回收站恢复。",
    },
    "en-US": {
      updatedAt: "Updated at:",
      createdAt: "Created at:",
      editTitle: "Edit title",
      trash: "Move to dustbin",
      editTitlePrompt: "Enter a new session title",
      trashConfirm:
        "Move this session to the dustbin? You can restore it later.",
    },
  },
  useScope: "local",
})

const sessionRoute = computed(() => ({
  name: "session",
  params: {
    sessionId: props.session.id,
  },
}))

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

function requestEditTitle(): void {
  const title = window.prompt(t("editTitlePrompt"), props.session.title)
  if (title === null) return

  const nextTitle = title.trim()
  if (nextTitle === "" || nextTitle === props.session.title) return

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
      <RouterLink class="block min-w-0" :to="sessionRoute">
        <h2 class="truncate text-lg">
          {{ session.title }}
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

    <RouterLink class="block" :to="sessionRoute">
      <div class="flex flex-col gap-2 px-3 py-2">
        <ol v-if="previewSigns.length > 0" class="flex flex-col gap-1">
          <SignLine
            v-for="(sign, index) in previewSigns"
            :key="index"
            :sign="sign"
          />
        </ol>
      </div>
    </RouterLink>

    <template #footer>
      <div class="flex flex-col gap-1 text-sm">
        <p class="truncate">
          {{ t("updatedAt") }} {{ formatDateTime(session.updatedAt) }}
        </p>
        <p class="truncate">
          {{ t("createdAt") }} {{ formatDateTime(session.createdAt) }}
        </p>
      </div>
    </template>
  </Card>
</template>
