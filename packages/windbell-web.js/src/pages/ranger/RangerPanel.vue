<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { makeDividerState } from "../../components/divider/DividerState"
import ResizeDivider from "../../components/divider/ResizeDivider.vue"
import { rangerMessages } from "./Ranger.i18n"
import RangerSidebar from "./components/RangerSidebar.vue"
import RangerView from "./components/RangerView.vue"
import {
  goParent,
  loadRanger,
  makeRangerState,
  moveSelection,
  openSelectedEntry,
  selectEntry,
  watchRanger,
} from "./RangerState"

const props = defineProps<{
  workspaceId: string
  locationStorageKey: string
}>()

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const state = makeRangerState(props.workspaceId, props.locationStorageKey)
const sidebarDivider = makeDividerState({
  defaultRatio: 0.25,
  minRatio: 0.15,
  maxRatio: 0.5,
  storageKey: "windbell.ranger.sidebarRatio",
})
const panel = ref<HTMLElement | null>(null)

let stopWatch: (() => void) | undefined

function focusPanel(): void {
  panel.value?.focus({ preventScroll: true })
}

function startWatching(): void {
  stopWatching()
  stopWatch = watchRanger(state, (error) => {
    state.error = error.message
  })
}

function stopWatching(): void {
  stopWatch?.()
  stopWatch = undefined
}

function handleSelect(index: number): void {
  state.focus = "sidebar"
  selectEntry(state, index)
}

async function handleKeydown(event: KeyboardEvent): Promise<void> {
  switch (event.key) {
    case "ArrowUp": {
      if (state.focus !== "sidebar") return
      event.preventDefault()
      moveSelection(state, -1)
      return
    }

    case "ArrowDown": {
      if (state.focus !== "sidebar") return
      event.preventDefault()
      moveSelection(state, 1)
      return
    }

    case "ArrowLeft": {
      event.preventDefault()

      if (state.focus === "view") {
        state.focus = "sidebar"
        return
      }

      await goParent(state)
      return
    }

    case "ArrowRight": {
      if (state.focus === "view") return
      event.preventDefault()
      await openSelectedEntry(state)
      return
    }

    case "Escape": {
      if (state.focus !== "view") return
      event.preventDefault()
      state.focus = "sidebar"
    }
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented) return
  if (event.target !== event.currentTarget) return

  void handleKeydown(event)
}

onMounted(async () => {
  focusPanel()
  await loadRanger(state)
  startWatching()
})

watch(
  () => [props.workspaceId, props.locationStorageKey] as const,
  async ([workspaceId, locationStorageKey]) => {
    stopWatching()
    state.workspaceId = workspaceId
    state.locationStorageKey = locationStorageKey
    await loadRanger(state)
    startWatching()
  },
)

onBeforeUnmount(() => {
  stopWatching()
})
</script>

<template>
  <main
    ref="panel"
    class="flex h-screen w-full overflow-hidden outline-none"
    tabindex="0"
    @pointerdown="focusPanel"
    @keydown="onKeydown"
  >
    <RangerSidebar
      class="shrink-0"
      :style="{ width: `${sidebarDivider.ratio * 100}%` }"
      :root="state.root"
      :current-directory="state.currentDirectory"
      :entries="state.entries"
      :selected-index="state.selectedIndex"
      :focus="state.focus"
      @select="handleSelect($event)"
    />

    <ResizeDivider :state="sidebarDivider" />

    <section
      v-if="state.loading"
      class="flex min-w-0 flex-1 items-start px-4 py-3"
    >
      <p class="text-ink">
        {{ t("loading") }}
      </p>
    </section>

    <section
      v-else-if="state.error !== undefined"
      class="flex min-w-0 flex-1 items-start px-4 py-3"
    >
      <p class="text-danger">
        {{ state.error }}
      </p>
    </section>

    <RangerView v-else class="min-w-0 flex-1" :entry="state.selectedEntry" />
  </main>
</template>
