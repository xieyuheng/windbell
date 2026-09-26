<script setup lang="ts">
import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { rangerMessages } from "../Ranger.i18n"

const props = defineProps<{
  entry: FileSystemEntry
}>()

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const fileSystem = makeFileSystemClient({
  baseUrl: "/api/fs",
})

const loading = ref(false)
const error = ref<string | undefined>(undefined)
const content = ref("")

let requestId = 0

watch(
  () => props.entry,
  async (entry) => {
    const currentRequestId = ++requestId

    loading.value = false
    error.value = undefined
    content.value = ""

    loading.value = true

    try {
      const text = await fileSystem.read(entry.path)
      if (currentRequestId !== requestId) return

      content.value = text
    } catch (caught) {
      if (currentRequestId !== requestId) return

      error.value = caught instanceof Error ? caught.message : String(caught)
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
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <p v-if="loading" class="px-4 py-3 text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="error !== undefined" class="px-4 py-3 text-danger">
      {{ error }}
    </p>

    <pre
      v-else
      class="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-sm text-ink"
      >{{ content }}</pre>
  </div>
</template>
