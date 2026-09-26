<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { rangerMessages } from "./Ranger.i18n"
import RangerSidebar from "./components/RangerSidebar.vue"
import RangerView from "./components/RangerView.vue"
import { loadRanger, makeRangerState, selectEntry } from "./RangerState"

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspaceId ?? ""))

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})

const state = makeRangerState(workspaceId.value)

onMounted(async () => {
  await loadRanger(state)
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
      @select="selectEntry(state, $event)"
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
