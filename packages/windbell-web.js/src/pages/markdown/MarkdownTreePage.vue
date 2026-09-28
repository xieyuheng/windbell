<script setup lang="ts">
import type { Root } from "mdast"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import MediumButton from "../../components/buttons/MediumButton.vue"
import { parseMarkdown } from "../../components/markdown/parseMarkdown"
import { markdownMessages } from "./Markdown.i18n"
import {
  markdownSourceFromQuery,
  markdownSourceQueryKey,
} from "./markdownSource"

const { t } = useI18n({
  messages: markdownMessages,
  useScope: "local",
})
const route = useRoute()

const source = computed(() =>
  markdownSourceFromQuery(route.query[markdownSourceQueryKey]),
)

const parsed = computed<{
  root: Root | undefined
  error: string | undefined
}>(() => {
  if (source.value === undefined) {
    return { root: undefined, error: undefined }
  }

  try {
    return { root: parseMarkdown(source.value), error: undefined }
  } catch (caught) {
    return {
      root: undefined,
      error: caught instanceof Error ? caught.message : String(caught),
    }
  }
})

const treeJson = computed(() =>
  parsed.value.root === undefined
    ? ""
    : JSON.stringify(parsed.value.root, null, 2),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <MediumButton :to="{ name: 'markdown-upload' }">
        {{ t("uploadNewFile") }}
      </MediumButton>
      <MediumButton :to="{ name: 'markdown-render', query: route.query }">
        {{ t("viewRender") }}
      </MediumButton>
    </div>

    <p class="text-sm text-ink-muted">{{ t("treeDescription") }}</p>

    <p v-if="parsed.error !== undefined" class="text-danger">
      {{ t("parseError", { message: parsed.error }) }}
    </p>

    <p v-else-if="parsed.root === undefined" class="text-ink-muted">
      {{ t("sourceMissing") }}
    </p>

    <pre
      v-else
      class="min-h-0 overflow-auto rounded bg-paper-deep p-3 font-mono text-xs text-ink thin-scrollbar"
      >{{ treeJson }}</pre>
  </div>
</template>
