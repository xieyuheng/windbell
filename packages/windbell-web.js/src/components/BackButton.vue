<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

defineProps<{
  floating?: boolean
}>()

const router = useRouter()
const { t } = useI18n()

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: "workspace-list" })
  }
}
</script>

<template>
  <template v-if="floating">
    <div
      class="shrink-0"
      :style="{ height: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }"
    />

    <div
      class="pointer-events-none fixed inset-x-0 z-50 mx-auto max-w-4xl px-4"
      :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
    >
      <button
        type="button"
        class="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/70 text-ink-muted backdrop-blur transition-colors hover:text-ink"
        @click="goBack()"
      >
        <ArrowLeft :size="18" :stroke-width="1.5" aria-hidden="true" />
        <span class="sr-only">{{ t("app.back") }}</span>
      </button>
    </div>
  </template>

  <button
    v-else
    type="button"
    class="inline-flex items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
    @click="goBack()"
  >
    <ArrowLeft :size="16" :stroke-width="1.5" aria-hidden="true" />
    <span>{{ t("app.back") }}</span>
  </button>
</template>
