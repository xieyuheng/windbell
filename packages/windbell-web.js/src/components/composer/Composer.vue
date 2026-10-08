<script setup lang="ts">
import { ArrowUp, Maximize2, Minimize2, Square } from "@lucide/vue"
import { computed, nextTick, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { composerMessages } from "./Composer.i18n.ts"
import {
  captureCompactMetrics,
  readSelection,
  resizeTextarea,
  wouldWrapInCompact,
  writeSelection,
  type CompactMetrics,
} from "./composerText.ts"

const props = withDefaults(
  defineProps<{
    modelValue: string
    collapsible?: boolean
    disabled?: boolean
    submitDisabled?: boolean
    submitting?: boolean
    placeholder?: string
    submitLabel?: string
    submittingLabel?: string
    collapseOnSubmit?: boolean
    minRows?: number
    maxHeight?: string
  }>(),
  {
    collapsible: true,
    disabled: false,
    submitDisabled: false,
    submitting: false,
    placeholder: "",
    submitLabel: "Send",
    submittingLabel: "Sending...",
    collapseOnSubmit: true,
    minRows: 5,
    maxHeight: "calc(100dvh - 6rem)",
  },
)

const emit = defineEmits<{
  "update:modelValue": [value: string]
  submit: []
}>()

const { t } = useI18n({
  messages: composerMessages,
  useScope: "local",
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
})

const expanded = ref(false)
const compactTextarea = ref<HTMLTextAreaElement | null>(null)
const expandedTextarea = ref<HTMLTextAreaElement | null>(null)
const compactOverflow = ref(false)

let compactMetrics: CompactMetrics | null = null

const showExpanded = computed(() => !props.collapsible || expanded.value)
const hasNewline = computed(() => /[\r\n]/.test(input.value))
const canCollapse = computed(() => {
  if (input.value === "") return true
  if (hasNewline.value) return false
  return !compactOverflow.value
})
const minHeight = computed(() => `calc(${props.minRows} * 1.5rem + 1rem)`)

function updateCompactOverflow(): void {
  compactOverflow.value =
    hasNewline.value || wouldWrapInCompact(input.value, compactMetrics)
}

async function resizeExpandedTextarea(): Promise<void> {
  await nextTick()

  if (!showExpanded.value) return
  resizeTextarea(expandedTextarea.value)
}

async function expand(options: { overflow?: boolean } = {}): Promise<void> {
  if (!props.collapsible || showExpanded.value) return

  const selection = readSelection(compactTextarea.value, input.value.length)
  compactMetrics = captureCompactMetrics(compactTextarea.value)
  compactOverflow.value =
    options.overflow === true ||
    hasNewline.value ||
    wouldWrapInCompact(input.value, compactMetrics)
  expanded.value = true

  await nextTick()
  writeSelection(expandedTextarea.value, selection)
  await resizeExpandedTextarea()
}

async function checkCompactOverflow(): Promise<void> {
  await nextTick()

  const element = compactTextarea.value
  if (element === null || showExpanded.value) return

  const overflow = element.scrollHeight > element.clientHeight + 1
  compactOverflow.value = overflow || hasNewline.value
  if (compactOverflow.value) {
    await expand({ overflow: true })
  }
}

async function collapse(): Promise<void> {
  if (!props.collapsible || !expanded.value || !canCollapse.value) return

  const selection = readSelection(expandedTextarea.value, input.value.length)
  expanded.value = false
  compactOverflow.value = false

  await nextTick()
  writeSelection(compactTextarea.value, selection)
  await checkCompactOverflow()
}

function updateState(): void {
  if (showExpanded.value) {
    if (props.collapsible) {
      updateCompactOverflow()
    }

    void resizeExpandedTextarea()
    return
  }

  void checkCompactOverflow()
}

watch(input, updateState, { flush: "post" })

onMounted(() => {
  if (showExpanded.value) {
    void resizeExpandedTextarea()
  }
})

function submit(): void {
  if (props.disabled || props.submitDisabled || props.submitting) return

  const hadContent = input.value.trim() !== ""
  emit("submit")

  if (!props.collapsible || !props.collapseOnSubmit || !expanded.value) return

  void nextTick().then(() => {
    if (hadContent && input.value === "" && expanded.value) {
      void collapse()
    }
  })
}

function handleCompactKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" || event.isComposing) return

  event.preventDefault()
  submit()
}

function handleToggle(): void {
  if (expanded.value) {
    void collapse()
  } else {
    void expand()
  }
}
</script>

<template>
  <form
    v-if="!showExpanded"
    class="pointer-events-auto flex w-full items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
    @submit.prevent="submit"
  >
    <textarea
      ref="compactTextarea"
      v-model="input"
      class="h-10 min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink disabled:opacity-50"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      rows="1"
      wrap="soft"
      @keydown="handleCompactKeydown"
    />

    <button
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-line/50 hover:text-ink"
      type="button"
      :aria-label="t('expandInput')"
      :title="t('expandInput')"
      @click="handleToggle"
    >
      <Maximize2 :size="16" :stroke-width="1.5" aria-hidden="true" />
    </button>

    <button
      class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sign-user/60 text-ink transition-transform duration-150 hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
      type="submit"
      :disabled="props.disabled || props.submitDisabled || props.submitting"
      :aria-label="props.submitting ? props.submittingLabel : props.submitLabel"
      :title="props.submitting ? props.submittingLabel : props.submitLabel"
    >
      <Square
        v-if="props.submitting"
        :size="12"
        class="fill-current"
        aria-hidden="true"
      />

      <ArrowUp v-else :size="18" :stroke-width="1.5" aria-hidden="true" />
    </button>
  </form>

  <form
    v-else
    class="pointer-events-auto flex w-full flex-col gap-2 overflow-hidden rounded-2xl border border-line/60 bg-paper/60 p-2 backdrop-blur transition-colors"
    @submit.prevent="submit"
  >
    <textarea
      ref="expandedTextarea"
      v-model="input"
      class="thin-scrollbar w-full resize-none overflow-y-auto bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink disabled:opacity-50"
      :disabled="props.disabled"
      :placeholder="props.placeholder"
      :rows="props.minRows"
      :style="{
        minHeight,
        maxHeight: props.maxHeight,
      }"
    />

    <div class="flex shrink-0 items-center justify-end gap-2">
      <button
        v-if="props.collapsible"
        class="flex h-10 w-10 items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-line/50 hover:text-ink disabled:pointer-events-none disabled:opacity-40"
        type="button"
        :disabled="!canCollapse"
        :aria-label="t('collapseInput')"
        :title="t('collapseInput')"
        @click="handleToggle"
      >
        <Minimize2 :size="16" :stroke-width="1.5" aria-hidden="true" />
      </button>

      <button
        class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sign-user/60 text-ink transition-transform duration-150 hover:scale-110 disabled:pointer-events-none disabled:opacity-50"
        type="submit"
        :disabled="props.disabled || props.submitDisabled || props.submitting"
        :aria-label="
          props.submitting ? props.submittingLabel : props.submitLabel
        "
        :title="props.submitting ? props.submittingLabel : props.submitLabel"
      >
        <Square
          v-if="props.submitting"
          :size="12"
          class="fill-current"
          aria-hidden="true"
        />

        <ArrowUp v-else :size="18" :stroke-width="1.5" aria-hidden="true" />
      </button>
    </div>
  </form>
</template>
