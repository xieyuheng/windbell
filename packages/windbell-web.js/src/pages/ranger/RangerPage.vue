<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onBeforeUnmount, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
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
} from "./RangerState"

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspaceId ?? ""))

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const state = makeRangerState(workspaceId.value)

function handleSelect(index: number): void {
  state.focus = "sidebar"
  selectEntry(state, index)
}

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  )
}

async function handleKeydown(event: KeyboardEvent): Promise<void> {
  if (event.defaultPrevented || isTextInput(event.target)) return

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
  void handleKeydown(event)
}

onMounted(async () => {
  window.addEventListener("keydown", onKeydown)
  await loadRanger(state)
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown)
})

watch(workspaceId, async (value) => {
  state.workspaceId = value
  await loadRanger(state)
})

useHead(() => ({
  title: t("title"),
  meta: [
    {
      name: "description",
      content: t("description"),
    },
  ],
}))
</script>

<template>
  <main class="flex h-screen w-full overflow-hidden">
    <RangerSidebar
      class="w-1/4 shrink-0"
      :root="state.root"
      :current-directory="state.currentDirectory"
      :entries="state.entries"
      :selected-index="state.selectedIndex"
      :focus="state.focus"
      @select="handleSelect($event)"
    />

    <section v-if="state.loading" class="flex flex-1 items-start px-4 py-3">
      <p class="text-ink">
        {{ t("loading") }}
      </p>
    </section>

    <section
      v-else-if="state.error !== undefined"
      class="flex flex-1 items-start px-4 py-3"
    >
      <p class="text-danger">
        {{ state.error }}
      </p>
    </section>

    <RangerView v-else class="flex-1" :entry="state.selectedEntry" />
  </main>
</template>
