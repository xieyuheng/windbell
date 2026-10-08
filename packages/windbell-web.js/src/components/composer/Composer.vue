<script setup lang="ts">
import { ArrowUp, Maximize2, Minimize2, Square } from "@lucide/vue"
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { composerMessages } from "./Composer.i18n.ts"
import {
  captureCompactMetrics,
  readSelection,
  resizeTextarea,
  wouldWrapInCompact,
  writeSelection,
  type CompactMetrics,
  type TextSelection,
} from "./composerText.ts"

type AnimationMode = "expanding" | "collapsing"

const ANIMATION_DURATION = 160

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

const shellRef = ref<HTMLElement | null>(null)
const compactForm = ref<HTMLElement | null>(null)
const expandedForm = ref<HTMLElement | null>(null)
const compactTextarea = ref<HTMLTextAreaElement | null>(null)
const expandedTextarea = ref<HTMLTextAreaElement | null>(null)

const expanded = ref(false)
const compactOverflow = ref(false)
const compactHeight = ref(0)
const shellHeight = ref<string | undefined>(undefined)
const isAnimating = ref(false)
const animationMode = ref<AnimationMode | null>(null)
const pendingSelection = ref<TextSelection | null>(null)

let compactMetrics: CompactMetrics | null = null
let finishTimer: number | undefined

const showExpanded = computed(() => !props.collapsible || expanded.value)
const hasNewline = computed(() => /[\r\n]/.test(input.value))
const canCollapse = computed(() => {
  if (input.value === "") return true
  if (hasNewline.value) return false
  return !compactOverflow.value
})
const minHeight = computed(() => `calc(${props.minRows} * 1.5rem + 1rem)`)

function forceReflow(): void {
  void shellRef.value?.offsetHeight
}

function captureCompactHeight(): void {
  const height = compactForm.value?.offsetHeight
  if (height !== undefined && height > 0) {
    compactHeight.value = height
  }
}

function scheduleAnimationFinish(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    void finishAnimation()
    return
  }

  if (finishTimer !== undefined) {
    window.clearTimeout(finishTimer)
  }

  finishTimer = window.setTimeout(() => {
    finishTimer = undefined
    void finishAnimation()
  }, ANIMATION_DURATION + 40)
}

function updateCompactOverflow(): void {
  compactOverflow.value =
    hasNewline.value || wouldWrapInCompact(input.value, compactMetrics)
}

async function resizeExpandedTextarea(): Promise<void> {
  await nextTick()

  if (!showExpanded.value) return
  resizeTextarea(expandedTextarea.value)
}

async function finishAnimation(): Promise<void> {
  if (!isAnimating.value) return

  if (finishTimer !== undefined) {
    window.clearTimeout(finishTimer)
    finishTimer = undefined
  }

  const selection =
    pendingSelection.value ?? readSelection(null, input.value.length)
  pendingSelection.value = null

  if (animationMode.value === "expanding") {
    isAnimating.value = false
    animationMode.value = null
    shellHeight.value = undefined
    writeSelection(expandedTextarea.value, selection)
    await resizeExpandedTextarea()
    return
  }

  if (animationMode.value === "collapsing") {
    expanded.value = false
    await nextTick()

    isAnimating.value = false
    animationMode.value = null
    shellHeight.value = undefined
    captureCompactHeight()

    writeSelection(compactTextarea.value, selection)
    await checkCompactOverflow()
  }
}

async function expand(options: { overflow?: boolean } = {}): Promise<void> {
  if (!props.collapsible || showExpanded.value || isAnimating.value) return

  pendingSelection.value = readSelection(
    compactTextarea.value,
    input.value.length,
  )
  compactMetrics = captureCompactMetrics(compactTextarea.value)
  compactOverflow.value =
    options.overflow === true ||
    hasNewline.value ||
    wouldWrapInCompact(input.value, compactMetrics)

  const startHeight = compactForm.value?.offsetHeight ?? compactHeight.value
  isAnimating.value = true
  animationMode.value = "expanding"
  shellHeight.value = `${startHeight}px`
  expanded.value = true

  await nextTick()

  resizeTextarea(expandedTextarea.value)
  const endHeight = expandedForm.value?.offsetHeight ?? startHeight
  forceReflow()
  shellHeight.value = `${endHeight}px`
  scheduleAnimationFinish()
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
  if (isAnimating.value) return

  pendingSelection.value = readSelection(
    expandedTextarea.value,
    input.value.length,
  )
  compactOverflow.value = false

  const startHeight = expandedForm.value?.offsetHeight ?? 0
  const endHeight = compactHeight.value || 40
  isAnimating.value = true
  animationMode.value = "collapsing"
  shellHeight.value = `${startHeight}px`

  await nextTick()
  forceReflow()
  shellHeight.value = `${endHeight}px`
  scheduleAnimationFinish()
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
    return
  }

  captureCompactHeight()
})

onBeforeUnmount(() => {
  if (finishTimer !== undefined) {
    window.clearTimeout(finishTimer)
  }
})

function handleShellTransitionEnd(event: TransitionEvent): void {
  if (event.target !== shellRef.value || event.propertyName !== "height") return
  void finishAnimation()
}

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
  <div
    ref="shellRef"
    class="composer-shell relative flex w-full flex-col justify-end"
    :class="{ 'overflow-hidden': isAnimating }"
    :style="shellHeight === undefined ? undefined : { height: shellHeight }"
    @transitionend="handleShellTransitionEnd"
  >
    <form
      v-if="!showExpanded"
      ref="compactForm"
      class="composer-surface pointer-events-auto flex w-full shrink-0 items-center gap-2 rounded-full border border-line/60 bg-paper/60 backdrop-blur transition-colors"
      @submit.prevent="submit"
    >
      <textarea
        ref="compactTextarea"
        v-model="input"
        class="h-10 min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink/60 disabled:opacity-50"
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
    </form>

    <form
      v-else
      ref="expandedForm"
      class="composer-surface pointer-events-auto flex w-full shrink-0 flex-col gap-2 overflow-hidden rounded-2xl border border-line/60 bg-paper/60 p-2 backdrop-blur transition-colors"
      @submit.prevent="submit"
    >
      <textarea
        ref="expandedTextarea"
        v-model="input"
        class="thin-scrollbar w-full resize-none overflow-y-auto bg-transparent px-3 py-2 leading-6 text-ink outline-none placeholder:text-ink/60 disabled:opacity-50"
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
  </div>
</template>

<style scoped>
.composer-shell {
  transition: height 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.composer-surface {
  transition:
    border-color 160ms ease-out,
    box-shadow 160ms ease-out;
}

.composer-surface:hover {
  border-color: color-mix(in oklab, var(--color-ink) 28%, transparent);
}

.composer-surface:focus-within {
  border-color: color-mix(in oklab, var(--color-sign-user) 58%, transparent);
  box-shadow: 0 0 0 3px
    color-mix(in oklab, var(--color-sign-user) 24%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .composer-shell {
    transition: none;
  }
}
</style>
