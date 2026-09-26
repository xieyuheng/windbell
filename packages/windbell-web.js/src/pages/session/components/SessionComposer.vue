<script setup lang="ts">
import { ArrowUp, Square } from "@lucide/vue"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { sessionMessages } from "../Session.i18n"

const props = defineProps<{
  modelValue: string
  interpreting: boolean
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  send: []
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
})

function submit(): void {
  emit("send")
}
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-[env(safe-area-inset-bottom,0px)] z-10 px-2 py-4"
  >
    <form
      class="pointer-events-auto flex w-full items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
      @submit.prevent="submit"
    >
      <input
        v-model="input"
        class="min-w-0 flex-1 bg-transparent px-4 py-2 text-ink outline-none placeholder:text-ink-muted"
        :placeholder="t('inputPlaceholder')"
        type="text"
      />
      <button
        class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-interactive/60 text-ink transition-transform duration-150 hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
        type="submit"
        :disabled="props.interpreting"
        :aria-label="props.interpreting ? t('sending') : t('send')"
        :title="props.interpreting ? t('sending') : t('send')"
      >
        <Square
          v-if="props.interpreting"
          :size="12"
          class="fill-current"
          aria-hidden="true"
        />

        <ArrowUp v-else :size="18" :stroke-width="1.5" aria-hidden="true" />
      </button>
    </form>
  </div>
</template>
