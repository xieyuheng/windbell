<script setup lang="ts">
import { ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import MediumButton from "../../components/buttons/MediumButton.vue"
import Card from "../../components/card/Card.vue"
import { markdownMessages } from "./Markdown.i18n"
import { encodeMarkdownSource, markdownSourceQueryKey } from "./markdownSource"

const { t } = useI18n({
  messages: markdownMessages,
  useScope: "local",
})
const router = useRouter()

const file = ref<File | undefined>(undefined)
const source = ref<string | undefined>(undefined)
const loading = ref(false)
const error = ref<string | undefined>(undefined)

async function handleFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const selected = input.files?.[0]
  if (selected === undefined) return

  file.value = selected
  source.value = undefined
  error.value = undefined
  loading.value = true

  try {
    source.value = await selected.text()
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : String(caught)
  } finally {
    loading.value = false
  }
}

function goTo(name: "markdown-render" | "markdown-tree"): void {
  if (source.value === undefined) return

  void router.push({
    name,
    query: {
      [markdownSourceQueryKey]: encodeMarkdownSource(source.value),
    },
  })
}
</script>

<template>
  <Card as="section">
    <template #header>
      <h2 class="text-ink">{{ t("upload") }}</h2>
    </template>

    <div class="flex flex-col gap-3 p-3">
      <label
        class="inline-flex cursor-pointer items-center justify-center rounded border-2 border-line px-3 py-2 text-sm text-ink transition-colors hover:bg-paper-deep"
      >
        <input
          class="hidden"
          type="file"
          accept=".md,.markdown,.txt,text/markdown"
          @change="handleFileChange"
        />
        <span>{{ t("chooseFile") }}</span>
      </label>

      <p v-if="loading" class="text-sm text-ink-muted">
        {{ t("selecting") }}
      </p>
      <p v-else-if="file !== undefined" class="text-sm text-ink-muted">
        {{ t("selectedFile", { name: file.name }) }}
      </p>
      <p v-else class="text-sm text-ink-muted">
        {{ t("noFile") }}
      </p>

      <p v-if="error !== undefined" class="text-sm text-danger">
        {{ t("readError", { message: error }) }}
      </p>

      <div class="flex flex-wrap gap-2">
        <MediumButton
          :disabled="source === undefined || loading"
          @click="goTo('markdown-render')"
        >
          {{ t("viewRender") }}
        </MediumButton>

        <MediumButton
          :disabled="source === undefined || loading"
          @click="goTo('markdown-tree')"
        >
          {{ t("viewTree") }}
        </MediumButton>
      </div>
    </div>
  </Card>
</template>
