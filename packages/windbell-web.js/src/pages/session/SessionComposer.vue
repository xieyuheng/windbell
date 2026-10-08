<script setup lang="ts">
import { ArrowUp, Maximize2, Minimize2, Square } from "@lucide/vue"
import { computed, nextTick, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { sessionMessages } from "./Session.i18n.ts"

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

const expanded = ref(false)
const compactTextarea = ref<HTMLTextAreaElement | null>(null)
const expandedTextarea = ref<HTMLTextAreaElement | null>(null)
const compactOverflow = ref(false)

let compactMetrics: { width: number; font: string } | null = null
let measureContext: CanvasRenderingContext2D | null | undefined

const hasNewline = computed(() => /[\r\n]/.test(input.value))
const canCollapse = computed(() => {
  if (input.value === "") return true
  if (hasNewline.value) return false
  return !compactOverflow.value
})

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureContext === undefined) {
    measureContext = document.createElement("canvas").getContext("2d")
  }

  return measureContext
}

function captureCompactMetrics(): void {
  const element = compactTextarea.value
  if (element === null) return

  const style = getComputedStyle(element)
  const horizontalPadding =
    Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight)
  const width = element.clientWidth - horizontalPadding
  if (!Number.isFinite(width) || width <= 0) return

  compactMetrics = {
    width,
    font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
  }
}

function wouldWrapInCompact(value: string): boolean {
  const metrics = compactMetrics
  if (metrics === null) return false

  const context = getMeasureContext()
  if (context === null) return false

  context.font = metrics.font
  return value
    .split(/\r?\n/)
    .some((line) => context.measureText(line).width > metrics.width + 0.5)
}

type TextSelection = {
  start: number
  end: number
}

function readSelection(element: HTMLTextAreaElement | null): TextSelection {
  const fallback = input.value.length
  return {
    start: element?.selectionStart ?? fallback,
    end: element?.selectionEnd ?? fallback,
  }
}

function writeSelection(
  element: HTMLTextAreaElement | null,
  selection: TextSelection,
): void {
  if (element === null) return

  element.focus()
  const max = element.value.length
  element.setSelectionRange(
    Math.min(selection.start, max),
    Math.min(selection.end, max),
  )
}

async function resizeExpandedTextarea(): Promise<void> {
  await nextTick()

  const element = expandedTextarea.value
  if (element === null || !expanded.value) return

  element.style.height = "auto"
  element.style.height = `${element.scrollHeight}px`
}

async function expand(options: { overflow?: boolean } = {}): Promise<void> {
  if (expanded.value) return

  const selection = readSelection(compactTextarea.value)
  captureCompactMetrics()
  compactOverflow.value =
    options.overflow === true ||
    hasNewline.value ||
    wouldWrapInCompact(input.value)
  expanded.value = true

  await nextTick()
  writeSelection(expandedTextarea.value, selection)
  await resizeExpandedTextarea()
}

async function checkCompactOverflow(): Promise<void> {
  await nextTick()

  const element = compactTextarea.value
  if (element === null || expanded.value) return

  const overflow = element.scrollHeight > element.clientHeight + 1
  compactOverflow.value = overflow || hasNewline.value
  if (compactOverflow.value) {
    await expand({ overflow: true })
  }
}

async function collapse(): Promise<void> {
  if (!expanded.value || !canCollapse.value) return

  const selection = readSelection(expandedTextarea.value)
  expanded.value = false
  compactOverflow.value = false

  await nextTick()
  writeSelection(compactTextarea.value, selection)
  await checkCompactOverflow()
}

function updateExpandedState(): void {
  if (expanded.value) {
    compactOverflow.value = hasNewline.value || wouldWrapInCompact(input.value)
    void resizeExpandedTextarea()
    return
  }

  void checkCompactOverflow()
}

watch(input, updateExpandedState, { flush: "post" })

async function submit(): Promise<void> {
  const hadContent = input.value.trim() !== ""
  emit("send")

  await nextTick()
  if (hadContent && input.value === "" && expanded.value) {
    await collapse()
  }
}

function handleCompactKeydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" || event.isComposing) return

  event.preventDefault()
  void submit()
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
    v-if="!expanded"
    class="pointer-events-auto flex w-full items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
    @submit.prevent="submit"
  >
    <textarea
      ref="compactTextarea"
      v-model="input"
      class="h-10 min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink"
      :placeholder="t('inputPlaceholder')"
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

  <form
    v-else
    class="pointer-events-auto absolute inset-x-2 bottom-4 flex max-h-[calc(100dvh-2rem)] flex-col gap-2 overflow-hidden rounded-2xl border border-line/60 bg-paper/60 p-2 backdrop-blur transition-colors"
    @submit.prevent="submit"
  >
    <textarea
      ref="expandedTextarea"
      v-model="input"
      class="thin-scrollbar max-h-[calc(100dvh-6rem)] min-h-[8.5rem] w-full resize-none overflow-y-auto bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink"
      :placeholder="t('inputPlaceholder')"
      rows="5"
    />

    <div class="flex shrink-0 items-center justify-end gap-2">
      <button
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
    </div>
  </form>
</template>
