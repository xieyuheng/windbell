<script setup lang="ts">
import type { FileSystemEntry } from "@xieyuheng/fs-api.js/client"
import type { Component } from "vue"
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { rangerMessages } from "../Ranger.i18n"
import { resolveEntryView } from "../views/registry"

const props = defineProps<{
  entry: FileSystemEntry | undefined
}>()

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const view = ref<Component | undefined>(undefined)
const loading = ref(false)

let requestId = 0

watch(
  () => props.entry,
  async (entry) => {
    const currentRequestId = ++requestId

    loading.value = false
    view.value = undefined

    if (entry === undefined) return

    loading.value = true

    try {
      const nextView = await resolveEntryView(entry)
      if (currentRequestId !== requestId) return

      view.value = nextView
    } finally {
      if (currentRequestId === requestId) {
        loading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden bg-paper">
    <div v-if="loading" class="px-4 py-3 text-ink">
      {{ t("loading") }}
    </div>

    <component v-else-if="view !== undefined" :is="view" :entry="entry" />

    <div v-else class="flex flex-1 items-center justify-center px-4 text-ink">
      {{ t("empty") }}
    </div>
  </section>
</template>
