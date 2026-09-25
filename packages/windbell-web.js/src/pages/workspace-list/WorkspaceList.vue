<script setup lang="ts">
import { Settings } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
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
  <main class="flex flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex items-start justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold text-ink">
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

    <form
      class="flex flex-col gap-3 rounded-2xl border border-line p-4"
      @submit.prevent="createWorkspace"
    >
      <h2 class="font-medium text-ink">
        {{ t("createWorkspace") }}
      </h2>

      <input
        v-model="name"
        class="rounded border border-line bg-transparent px-3 py-2 text-ink outline-none"
        :placeholder="t('name')"
        type="text"
      />

      <input
        v-model="root"
        class="rounded border border-line bg-transparent px-3 py-2 font-mono text-ink outline-none"
        :placeholder="t('root')"
        type="text"
      />

      <button
        class="rounded-full px-4 py-2 font-medium disabled:opacity-50"
        type="submit"
        :disabled="creating"
      >
        {{ creating ? t("creating") : t("create") }}
      </button>

      <p v-if="createError !== undefined" class="text-danger">
        {{ createError }}
      </p>
    </form>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <RouterLink
          class="block overflow-hidden rounded border-3 border-paper-deep transition-colors hover:border-ink-muted"
          :to="{ name: 'session-list', params: { workspaceId: workspace.id } }"
        >
          <div class="bg-paper-deep px-3 py-2">
            <h2 class="truncate text-base text-ink">
              {{ workspace.name }}
            </h2>
          </div>

          <div class="px-3 py-2">
            <p class="truncate font-mono text-ink">
              {{ workspace.root }}
            </p>
          </div>
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
