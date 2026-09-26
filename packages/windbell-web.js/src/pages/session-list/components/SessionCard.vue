<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import Card from "../../../components/Card.vue"
import SignLine from "../../session/components/SignLine.vue"

const props = withDefaults(
  defineProps<{
    session: S.Session
    previewLimit?: number
  }>(),
  {
    previewLimit: 3,
  },
)

const { locale } = useI18n()

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

function formatUpdatedAt(value: number): string {
  return new Intl.DateTimeFormat(locale.value, {
    month: "short",
    day: "numeric",
  }).format(value)
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
        <p class="truncate text-sm text-ink-muted">
          {{ formatUpdatedAt(session.updatedAt) }}
        </p>

        <ol v-if="previewSigns.length > 0" class="flex flex-col gap-1">
          <SignLine
            v-for="(sign, index) in previewSigns"
            :key="index"
            :sign="sign"
          />
        </ol>
      </div>
    </RouterLink>
  </Card>
</template>
