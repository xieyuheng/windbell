<script setup lang="ts">
import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import Markdown from "../../markdown/Markdown.vue"
import { rangerMessages } from "../Ranger.i18n"
import MarkdownToolbar from "./MarkdownToolbar.vue"
import {
  readStoredMarkdownViewMode,
  writeStoredMarkdownViewMode,
  type MarkdownViewMode,
} from "./MarkdownViewMode"

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
const mode = ref<MarkdownViewMode>(readStoredMarkdownViewMode())

let requestId = 0

function toggleMode(): void {
  mode.value = mode.value === "render" ? "source" : "render"
}

watch(mode, (value) => {
  writeStoredMarkdownViewMode(value)
})

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
  <div class="relative flex h-full min-h-0 flex-col overflow-hidden">
    <MarkdownToolbar
      v-if="loading === false && error === undefined"
      class="absolute right-3 top-3 z-10"
      :mode="mode"
      @toggle="toggleMode"
    />

    <p v-if="loading" class="px-4 py-3 text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="error !== undefined" class="px-4 py-3 text-danger">
      {{ error }}
    </p>

    <div
      v-else
      class="min-h-0 flex-1 overflow-auto px-4 py-3 pr-14 thin-scrollbar"
    >
      <Markdown v-if="mode === 'render'" :source="content" />

      <pre
        v-else
        class="m-0 font-mono text-sm whitespace-pre-wrap break-words text-ink"
        >{{ content }}</pre>
    </div>
  </div>
</template>
