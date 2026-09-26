<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import Card from "../../../components/Card.vue"
import SignLine from "./SignLine.vue"

const props = withDefaults(
  defineProps<{
    session: S.Session
    previewLimit?: number
  }>(),
  {
    previewLimit: 3,
  },
)

const { t } = useI18n({
  messages: {
    "zh-CN": {
      updatedAt: "更新于：",
      createdAt: "创建于：",
    },
    "en-US": {
      updatedAt: "Updated at:",
      createdAt: "Created at:",
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
</script>

<template>
  <Card as="article">
    <template #header>
      <RouterLink class="block min-w-0" :to="sessionRoute">
        <h2 class="truncate text-base text-ink">
          {{ session.title }}
        </h2>
      </RouterLink>
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
      <div class="flex flex-col gap-1 text-sm text-ink-muted">
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
