<script setup lang="ts">
import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { rangerMessages } from "../Ranger.i18n"

const props = defineProps<{
  entry: FileSystemEntry | undefined
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
const directoryEntries = ref<Array<FileSystemEntry>>([])
const fileContent = ref("")

let requestId = 0

watch(
  () => props.entry,
  async (entry) => {
    const currentRequestId = ++requestId

    loading.value = false
    error.value = undefined
    directoryEntries.value = []
    fileContent.value = ""

    if (entry === undefined) return

    loading.value = true

    try {
      if (entry.kind === "Directory") {
        const entries = await fileSystem.listEntries(entry.path)
        if (currentRequestId !== requestId) return

        directoryEntries.value = entries
      } else {
        const text = await fileSystem.read(entry.path)
        if (currentRequestId !== requestId) return

        fileContent.value = text
      }
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
  <section class="flex h-full min-h-0 flex-col overflow-hidden bg-paper">
    <p v-if="loading" class="px-4 py-3 text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="error !== undefined" class="px-4 py-3 text-danger">
      {{ error }}
    </p>

    <div
      v-else-if="entry === undefined"
      class="flex flex-1 items-center justify-center px-4 text-ink"
    >
      {{ t("empty") }}
    </div>

    <ol
      v-else-if="entry.kind === 'Directory'"
      class="min-h-0 flex-1 overflow-y-auto"
    >
      <li
        v-for="child in directoryEntries"
        :key="child.path"
        class="w-full truncate px-4 py-1 text-ink"
      >
        {{ child.kind === "Directory" ? `${child.name}/` : child.name }}
      </li>
    </ol>

    <pre
      v-else
      class="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-sm text-ink"
      >{{ fileContent }}</pre>
  </section>
</template>
