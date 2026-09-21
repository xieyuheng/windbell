<script setup lang="ts">
import { ArrowLeft } from "@lucide/vue"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const showBack = computed(() => route.name !== "workspace-list")

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: "workspace-list" })
  }
}
</script>

<template>
  <template v-if="showBack">
    <div
      class="shrink-0"
      :style="{ height: 'calc(env(safe-area-inset-top, 0px) + 4rem)' }"
    />

    <button
      type="button"
      class="fixed left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/70 text-ink-muted backdrop-blur transition-colors hover:text-ink"
      :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
      aria-label="Back"
      @click="goBack()"
    >
      <ArrowLeft :size="18" :stroke-width="1.5" aria-hidden="true" />
    </button>
  </template>
</template>
