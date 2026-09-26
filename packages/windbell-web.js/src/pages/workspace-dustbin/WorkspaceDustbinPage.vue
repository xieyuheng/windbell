<script setup lang="ts">
import { ArchiveRestore, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import BackButton from "../../components/buttons/BackButton.vue"
import Card from "../../components/card/Card.vue"
import { workspaceDustbinMessages } from "./WorkspaceDustbin.i18n"
import {
  loadWorkspaceDustbin,
  makeWorkspaceDustbinState,
  removeWorkspace,
  restoreWorkspace,
} from "./WorkspaceDustbinState"

const { t } = useI18n({
  messages: workspaceDustbinMessages,
  useScope: "local",
})

const state = makeWorkspaceDustbinState()
const busyWorkspaceId = ref<string | undefined>(undefined)

function formatDateTime(value: number): string {
  const date = new Date(value)
  const pad = (value: number): string => String(value).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function restore(workspace: S.DustbinWorkspace): Promise<void> {
  busyWorkspaceId.value = workspace.id
  state.error = undefined

  try {
    await restoreWorkspace(state, workspace.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    busyWorkspaceId.value = undefined
  }
}

async function remove(workspace: S.DustbinWorkspace): Promise<void> {
  if (!window.confirm(t("deleteConfirm"))) return

  busyWorkspaceId.value = workspace.id
  state.error = undefined

  try {
    await removeWorkspace(state, workspace.id)
  } catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  } finally {
    busyWorkspaceId.value = undefined
  }
}

onMounted(async () => {
  await loadWorkspaceDustbin(state)
})

useHead(() => ({
  title: t("title"),
}))
</script>

<template>
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <BackButton :to="{ name: 'home' }" />
      </div>
    </header>

    <h2 class="text-base text-ink">
      {{ t("deletedWorkspaces") }}
    </h2>

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ol
      v-else-if="state.workspaces.length > 0"
      class="flex flex-1 flex-col gap-4"
    >
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <Card as="article">
          <template #header>
            <h2 class="truncate text-base text-ink">
              {{ workspace.name }}
            </h2>

            <div class="mt-2 flex items-center gap-2">
              <button
                class="inline-flex items-center gap-1 rounded px-1 py-1 text-sm transition-colors hover:bg-paper/60 hover:text-ink disabled:opacity-50"
                type="button"
                :disabled="busyWorkspaceId === workspace.id"
                @click="restore(workspace)"
              >
                <ArchiveRestore
                  :size="16"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                <span>{{ t("restore") }}</span>
              </button>

              <button
                class="inline-flex items-center gap-1 rounded px-1 py-1 text-sm transition-colors hover:bg-paper/60 hover:text-danger disabled:opacity-50"
                type="button"
                :disabled="busyWorkspaceId === workspace.id"
                @click="remove(workspace)"
              >
                <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
                <span>{{ t("remove") }}</span>
              </button>
            </div>
          </template>

          <div class="px-3 py-2">
            <p class="truncate font-mono text-ink">
              {{ workspace.root }}
            </p>
          </div>

          <template #footer>
            <div class="flex flex-col gap-1 text-sm">
              <p class="truncate">
                {{ t("deletedAt") }} {{ formatDateTime(workspace.deletedAt) }}
              </p>
              <p class="truncate">
                {{ t("createdAt") }} {{ formatDateTime(workspace.createdAt) }}
              </p>
            </div>
          </template>
        </Card>
      </li>
    </ol>

    <div v-else class="flex flex-1 items-center justify-center text-ink">
      {{ t("empty") }}
    </div>
  </main>
</template>
