<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { rangerMessages } from "./Ranger.i18n"
import { readStoredSidebarRatio } from "./RangerLayout"
import RangerDivider from "./components/RangerDivider.vue"
import RangerSidebar from "./components/RangerSidebar.vue"
import RangerView from "./components/RangerView.vue"
import {
  goParent,
  loadRanger,
  makeRangerState,
  moveSelection,
  openSelectedEntry,
  selectEntry,
} from "./RangerState"

const props = defineProps<{
  workspaceId: string
}>()

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const state = makeRangerState(props.workspaceId)
const sidebarRatio = ref(readStoredSidebarRatio())
const panel = ref<HTMLElement | null>(null)

function focusPanel(): void {
  panel.value?.focus({ preventScroll: true })
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
})

watch(
  () => props.workspaceId,
  async (value) => {
    state.workspaceId = value
    await loadRanger(state)
  },
)
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
      :style="{ width: `${sidebarRatio * 100}%` }"
      :root="state.root"
      :current-directory="state.currentDirectory"
      :entries="state.entries"
      :selected-index="state.selectedIndex"
      :focus="state.focus"
      @select="handleSelect($event)"
    />

    <RangerDivider v-model:ratio="sidebarRatio" />

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
