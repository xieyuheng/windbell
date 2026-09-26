<script setup lang="ts">
import { Plus, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import SettingsButton from "../../components/buttons/SettingsButton.vue"
import Card from "../../components/card/Card.vue"
import WorkspaceCard from "./components/WorkspaceCard.vue"
import { homeMessages } from "./Home.i18n"
import {
  ensureWorkspace,
  loadHomeState,
  makeHomeState,
  trashWorkspace,
  updateWorkspaceTitle,
} from "./HomeState"

const { t } = useI18n({
  messages: homeMessages,
  useScope: "local",
})

const state = makeHomeState()
const name = ref("")
const root = ref("")
const creating = ref(false)
const createError = ref<string | undefined>(undefined)

onMounted(async () => {
  await loadHomeState(state)
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

async function handleTrashWorkspace(workspace: S.Workspace): Promise<void> {
  try {
    await trashWorkspace(state, workspace.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

async function handleUpdateWorkspaceTitle(
  workspace: S.Workspace,
  name: string,
): Promise<void> {
  try {
    await updateWorkspaceTitle(state, workspace.id, name)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
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
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <SettingsButton />

        <RouterLink
          class="inline-flex items-center gap-2 rounded border-2 border-line px-2 py-1.5 text-ink transition-colors hover:bg-line"
          :to="{ name: 'workspace-dustbin' }"
        >
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("workspaceDustbin") }}</span>
        </RouterLink>
      </div>
    </header>

    <Card as="form" @submit.prevent="createWorkspace">
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
    </Card>

    <h2 class="text-base text-ink">
      {{ t("workspaces") }}
    </h2>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <WorkspaceCard
          :workspace="workspace"
          @trash="handleTrashWorkspace(workspace)"
          @update-title="handleUpdateWorkspaceTitle(workspace, $event)"
        />
      </li>
    </ul>
  </main>
</template>
