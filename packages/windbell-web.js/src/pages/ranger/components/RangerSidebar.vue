<script setup lang="ts">
import type { FileSystemEntry } from "@xieyuheng/fs-api.js/client"
import { computed, nextTick, ref, watch } from "vue"

const props = defineProps<{
  root: string
  currentDirectory: string
  entries: Array<FileSystemEntry>
  selectedIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const list = ref<HTMLOListElement | null>(null)

watch(
  () => props.selectedIndex,
  async (index) => {
    await nextTick()

    const item = list.value?.children[index] as HTMLElement | undefined
    item?.scrollIntoView({ block: "nearest" })
  },
)

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
  <aside
    class="flex h-full min-h-0 flex-col overflow-hidden border-r border-line bg-paper"
  >
    <header class="shrink-0 px-3 py-2">
      <p class="truncate text-ink">
        {{ currentName }}
      </p>
    </header>

    <ol ref="list" class="min-h-0 flex-1 overflow-y-auto border-t border-line">
      <li
        v-for="(entry, index) in entries"
        :key="entry.path"
        class="w-full truncate px-3 py-1 text-ink"
        :class="{ 'bg-ink text-paper': index === selectedIndex }"
        @click="emit('select', index)"
      >
        {{ entry.kind === "Directory" ? `${entry.name}/` : entry.name }}
      </li>
    </ol>
  </aside>
</template>
