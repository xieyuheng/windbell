<script setup lang="ts">
import type { FileSystemEntry } from "@xieyuheng/fs-api.js/client"
import { computed } from "vue"
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

const view = computed(() => {
  if (props.entry === undefined) return undefined

  return resolveEntryView(props.entry)
})
</script>

<template>
  <section class="flex h-full min-h-0 flex-col overflow-hidden bg-paper">
    <component v-if="view !== undefined" :is="view" :entry="entry" />

    <div v-else class="flex flex-1 items-center justify-center px-4 text-ink">
      {{ t("empty") }}
    </div>
  </section>
</template>
