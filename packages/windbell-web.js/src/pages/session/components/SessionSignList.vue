<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import SignCard from "../../../components/sign/SignCard.vue"
import { sessionMessages } from "../Session.i18n"
import type { SessionState } from "../SessionState"

const props = defineProps<{
  state: SessionState
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const scroller = ref<HTMLElement | null>(null)
const bottomAnchor = ref<HTMLElement | null>(null)
const bottomAnchorVisible = ref(true)
const title = computed(() => props.state.title || t("notFound"))

let bottomObserver: IntersectionObserver | undefined

async function scrollToBottom(): Promise<void> {
  await nextTick()

  // Wait for a layout pass so sign cards have finished reflowing before
  // measuring scrollHeight.
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  const element = scroller.value
  if (element === null) return

  element.scrollTop = element.scrollHeight
}

function scheduleAutoScroll(): void {
  if (!bottomAnchorVisible.value) return

  void scrollToBottom()
}

onMounted(() => {
  if (bottomAnchor.value !== null) {
    bottomObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry !== undefined) {
        bottomAnchorVisible.value = entry.isIntersecting
      }
    })
    bottomObserver.observe(bottomAnchor.value)
  }
})

onBeforeUnmount(() => {
  bottomObserver?.disconnect()
})

watch(
  () => props.state.context.length,
  () => {
    scheduleAutoScroll()
  },
)

defineExpose({ scrollToBottom })
</script>

<template>
  <div
    ref="scroller"
    class="session-scroller min-h-0 flex-1 overflow-y-auto px-4 pt-19 pb-19"
  >
    <div class="flex w-full flex-col gap-6">
      <h1 class="text-xl text-ink">
        {{ title }}
      </h1>

      <p v-if="props.state.loading" class="text-ink">
        {{ t("loading") }}
      </p>

      <p v-else-if="props.state.error !== undefined" class="text-danger">
        {{ props.state.error }}
      </p>

      <ol v-else class="flex flex-col gap-4">
        <SignCard
          v-for="(sign, index) in props.state.context"
          :key="index"
          :sign="sign"
        />
      </ol>
    </div>

    <div ref="bottomAnchor" class="h-px w-full" />
  </div>
</template>
