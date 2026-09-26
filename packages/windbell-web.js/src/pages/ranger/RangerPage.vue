<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { rangerMessages } from "./Ranger.i18n"
import RangerSidebar from "./components/RangerSidebar.vue"
import { loadRanger, makeRangerState } from "./RangerState"

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
      :selected-index="0"
    />

    <section class="flex-1 bg-paper px-4 py-3">
      <p v-if="state.loading" class="text-ink">
        {{ t("loading") }}
      </p>

      <p v-else-if="state.error !== undefined" class="text-danger">
        {{ state.error }}
      </p>
    </section>
  </main>
</template>
