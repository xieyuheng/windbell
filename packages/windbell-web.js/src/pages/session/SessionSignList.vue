<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import SignCard from "../../components/sign/SignCard.vue"
import { sessionMessages } from "./Session.i18n.ts"
import type { SessionState } from "./SessionState.ts"

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
const title = computed(() =>
  props.state.hasLoaded ? props.state.title || t("notFound") : "",
)

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
    class="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-16 pb-18"
  >
    <div class="flex w-full flex-col gap-4">
      <h1 class="text-xl text-ink">
        {{ title }}
      </h1>

      <p
        v-if="props.state.error !== undefined && props.state.hasLoaded"
        class="text-sign-error"
      >
        {{ props.state.error }}
      </p>

      <p v-if="props.state.isLoading" class="text-ink">
        {{ t("loading") }}
      </p>

      <p
        v-else-if="props.state.error !== undefined && !props.state.hasLoaded"
        class="text-sign-error"
      >
        {{ props.state.error }}
      </p>

      <ol
        v-else
        class="flex flex-col gap-4"
        :class="{ 'opacity-60': props.state.isPending }"
        :aria-busy="props.state.isPending"
      >
        <SignCard
          v-for="(sign, index) in props.state.context"
          :key="index"
          :sign="sign"
          :workspace-root="props.state.workspaceRoot"
        />
      </ol>
    </div>

    <div ref="bottomAnchor" class="h-px w-full" />
  </div>
</template>
