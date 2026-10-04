<script setup lang="ts">
import { ArrowUp } from "@lucide/vue"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { workspaceMessages } from "./Workspace.i18n.ts"

const props = defineProps<{
  creating: boolean
}>()

const emit = defineEmits<{
  create: [content: string]
}>()

const { t } = useI18n({
  messages: workspaceMessages,
  useScope: "local",
})

const content = ref("")
const canSubmit = computed(() => content.value.trim() !== "" && !props.creating)

function submit(): void {
  if (!canSubmit.value) return

  emit("create", content.value.trim())
}
</script>

<template>
  <form
    class="flex w-full items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
    @submit.prevent="submit"
  >
    <input
      v-model="content"
      class="min-w-0 flex-1 bg-transparent px-3 py-2 text-ink outline-none placeholder:text-ink"
      :disabled="props.creating"
      :placeholder="t('newSessionPlaceholder')"
      type="text"
    />

    <button
      class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sign-user/60 text-ink transition-transform duration-150 hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      :aria-label="props.creating ? t('startingSession') : t('startSession')"
      :disabled="!canSubmit"
      :title="props.creating ? t('startingSession') : t('startSession')"
    >
      <ArrowUp :size="18" :stroke-width="1.5" aria-hidden="true" />
    </button>
  </form>
</template>
