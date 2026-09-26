<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import { rangerMessages } from "./Ranger.i18n"
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
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton
          :to="{
            name: 'workspace',
            params: { workspaceId },
          }"
        />
      </div>
    </header>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ul v-else-if="state.entries.length > 0" class="flex flex-col gap-1">
      <li v-for="entry in state.entries" :key="entry.path" class="text-ink">
        {{ entry.kind }} - {{ entry.name }}
      </li>
    </ul>

    <div v-else class="text-ink">
      {{ t("empty") }}
    </div>
  </main>
</template>
