<script setup lang="ts">
import { Plus, Settings } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import BaseCard from "../../components/BaseCard.vue"
import { workspaceListMessages } from "./WorkspaceList.i18n"
import {
  ensureWorkspace,
  loadWorkspaceList,
  makeWorkspaceListState,
} from "./WorkspaceListState"

const { t } = useI18n({
  messages: workspaceListMessages,
  useScope: "local",
})

const state = makeWorkspaceListState()
const name = ref("")
const root = ref("")
const creating = ref(false)
const createError = ref<string | undefined>(undefined)

onMounted(async () => {
  await loadWorkspaceList(state)
})

async function createWorkspace(): Promise<void> {
  creating.value = true
  createError.value = undefined

  try {
    await ensureWorkspace(state, {
      name: name.value,
      root: root.value,
    })

    name.value = ""
    root.value = ""
  } catch (error) {
    createError.value = error instanceof Error ? error.message : String(error)
  } finally {
    creating.value = false
  }
}

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
  <main class="flex flex-1 flex-col gap-6 px-5 py-6 max-w-4xl">
    <header class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-xl text-ink">
          {{ t("title") }}
        </h1>
        <p class="text-ink">
          {{ t("description") }}
        </p>
      </div>

      <RouterLink
        class="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink"
        :to="{ name: 'settings' }"
        :aria-label="t('settings')"
        :title="t('settings')"
      >
        <Settings :size="16" :stroke-width="1.5" aria-hidden="true" />
      </RouterLink>
    </header>

    <BaseCard as="form" @submit.prevent="createWorkspace">
      <template #header>
        <h2 class="text-ink">
          {{ t("createWorkspace") }}
        </h2>
      </template>

      <div class="flex flex-col gap-2 p-2">
        <input
          v-model="name"
          class="w-full rounded border border-line bg-transparent px-2 py-1.5 text-ink outline-none placeholder:text-ink-muted"
          :placeholder="t('name')"
          type="text"
        />

        <input
          v-model="root"
          class="w-full rounded border border-line bg-transparent px-2 py-1.5 font-mono text-ink outline-none placeholder:text-ink-muted"
          :placeholder="t('root')"
          type="text"
        />

        <button
          class="inline-flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-ink transition-colors hover:bg-paper-deep disabled:opacity-50"
          type="submit"
          :disabled="creating"
        >
          <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ creating ? t("creating") : t("create") }}</span>
        </button>

        <p v-if="createError !== undefined" class="px-2 text-danger">
          {{ createError }}
        </p>
      </div>
    </BaseCard>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <BaseCard
          :as="RouterLink"
          class="transition-colors hover:border-ink-muted"
          :to="{ name: 'session-list', params: { workspaceId: workspace.id } }"
        >
          <template #header>
            <h2 class="truncate text-base text-ink">
              {{ workspace.name }}
            </h2>
          </template>

          <div class="px-3 py-2">
            <p class="truncate font-mono text-ink">
              {{ workspace.root }}
            </p>
          </div>
        </BaseCard>
      </li>
    </ul>
  </main>
</template>
