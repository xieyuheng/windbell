<script setup lang="ts">
import type { FileSystemEntry } from "@xieyuheng/fs-api.js/client"
import { computed } from "vue"

const props = defineProps<{
  root: string
  currentDirectory: string
  entries: Array<FileSystemEntry>
  selectedIndex: number
}>()

const currentName = computed(() => {
  return pathName(props.currentDirectory || props.root)
})

function pathName(value: string): string {
  const trimmed = value.replace(/[/\\]+$/, "")
  const index = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"))

  return (index === -1 ? trimmed : trimmed.slice(index + 1)) || "/"
}
</script>

<template>
  <aside class="flex h-full min-h-0 flex-col overflow-hidden bg-paper-deep">
    <header class="shrink-0 border-b border-line px-3 py-2">
      <p class="truncate text-sm text-ink">
        {{ currentName }}
      </p>
    </header>

    <ol class="min-h-0 flex-1 overflow-y-auto">
      <li
        v-for="(entry, index) in entries"
        :key="entry.path"
        class="w-full truncate px-3 py-1 text-ink"
        :class="{ 'bg-ink text-paper': index === selectedIndex }"
      >
        {{ entry.kind === "Directory" ? `${entry.name}/` : entry.name }}
      </li>
    </ol>
  </aside>
</template>
