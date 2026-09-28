<script setup lang="ts">
import type { Root } from "mdast"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import MediumButton from "../../components/buttons/MediumButton.vue"
import Markdown from "../../components/markdown/Markdown.vue"
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
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <MediumButton :to="{ name: 'markdown-upload' }">
        {{ t("uploadNewFile") }}
      </MediumButton>
      <MediumButton :to="{ name: 'markdown-tree', query: route.query }">
        {{ t("viewTree") }}
      </MediumButton>
    </div>

    <p v-if="parsed.error !== undefined" class="text-danger">
      {{ t("parseError", { message: parsed.error }) }}
    </p>

    <p v-else-if="parsed.root === undefined" class="text-ink-muted">
      {{ t("sourceMissing") }}
    </p>

    <Markdown v-else :root="parsed.root" />
  </div>
</template>
