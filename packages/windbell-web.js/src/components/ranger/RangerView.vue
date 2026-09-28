<script setup lang="ts">
import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import type { Component } from "vue"
import { ref, shallowRef, watch } from "vue"
import { useI18n } from "vue-i18n"
import DirectoryView from "./views/DirectoryView.vue"
import UnknownView from "./views/UnknownView.vue"
import { rangerMessages } from "./Ranger.i18n"
import { resolveFileView } from "./views/registry"

const props = defineProps<{
  entry: FileSystemEntry | undefined
}>()

const fileSystem = makeFileSystemClient({
  baseUrl: "/api/fs",
})

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const fileView = shallowRef<Component | undefined>(undefined)
const fileContent = shallowRef<Uint8Array | undefined>(undefined)
const fileLoading = ref(false)
const fileError = ref<string | undefined>(undefined)

let requestId = 0

watch(
  () => props.entry,
  async (entry) => {
    const currentRequestId = ++requestId

    fileLoading.value = false
    fileError.value = undefined
    fileView.value = undefined
    fileContent.value = undefined

    if (entry === undefined || entry.kind === "Directory") return

    fileLoading.value = true

    try {
      const view = await resolveFileView(entry)
      if (currentRequestId !== requestId) return

      if (view === undefined) return

      const content = await fileSystem.readBytes(entry.path)
      if (currentRequestId !== requestId) return

      fileView.value = view
      fileContent.value = content
    } catch (caught) {
      if (currentRequestId !== requestId) return

      fileError.value =
        caught instanceof Error ? caught.message : String(caught)
    } finally {
      if (currentRequestId === requestId) {
        fileLoading.value = false
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden bg-paper">
    <DirectoryView v-if="entry?.kind === 'Directory'" :entry="entry" />

    <template v-else-if="entry?.kind === 'File'">
      <div v-if="fileLoading" class="px-4 py-3 text-ink">
        {{ t("loading") }}
      </div>

      <p v-else-if="fileError !== undefined" class="px-4 py-3 text-danger">
        {{ fileError }}
      </p>

      <component
        v-else-if="fileView !== undefined && fileContent !== undefined"
        :is="fileView"
        :content="fileContent"
      />

      <UnknownView v-else />
    </template>

    <div v-else class="flex flex-1 items-center justify-center px-4 text-ink">
      {{ t("empty") }}
    </div>
  </section>
</template>
