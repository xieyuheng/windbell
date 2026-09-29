<script setup lang="ts">
import { FileText, Plus, Settings, Trash2 } from "@lucide/vue"
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"
import MediumButton from "../../components/buttons/MediumButton.vue"
import WorkspaceCard from "./components/WorkspaceCard.vue"
import WorkspaceCreateDialog from "./components/WorkspaceCreateDialog.vue"
import { homeMessages } from "./Home.i18n.ts"
import {
  encodeMarkdownSource,
  markdownSourceQueryKey,
} from "../markdown/markdownSource.ts"
import {
  ensureWorkspace,
  loadHomeState,
  makeHomeState,
  trashWorkspace,
  updateWorkspaceTitle,
} from "./HomeState.ts"

const { t } = useI18n({
  messages: homeMessages,
  useScope: "local",
})
const router = useRouter()

const state = makeHomeState()
const createDialogOpen = ref(false)
const creating = ref(false)
const createError = ref<string | undefined>(undefined)
const markdownInput = ref<HTMLInputElement>()

function openMarkdownFilePicker(): void {
  markdownInput.value?.click()
}

async function handleMarkdownFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file === undefined) return

  try {
    const source = await file.text()
    await router.push({
      name: "markdown",
      query: {
        [markdownSourceQueryKey]: encodeMarkdownSource(source),
      },
    })
  } catch (caught) {
    state.error = caught instanceof Error ? caught.message : String(caught)
  } finally {
    input.value = ""
  }
}

onMounted(async () => {
  await loadHomeState(state)
})

function openCreateDialog(): void {
  createError.value = undefined
  createDialogOpen.value = true
}

function closeCreateDialog(): void {
  if (creating.value) return

  createDialogOpen.value = false
}

async function createWorkspace(options: {
  name: string
  root: string
}): Promise<void> {
  creating.value = true
  createError.value = undefined

  try {
    await ensureWorkspace(state, options)
    createDialogOpen.value = false
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
  <PageLayout>
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <MediumButton :to="{ name: 'settings' }">
          <Settings :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("app.settings") }}</span>
        </MediumButton>

        <MediumButton :to="{ name: 'workspace-dustbin' }">
          <Trash2 :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("workspaceDustbin") }}</span>
        </MediumButton>

        <MediumButton type="button" @click="openMarkdownFilePicker">
          <FileText :size="16" :stroke-width="1.5" aria-hidden="true" />
          <span>{{ t("markdownPreview") }}</span>
        </MediumButton>
      </div>
    </header>

    <input
      ref="markdownInput"
      class="hidden"
      type="file"
      accept=".md,.markdown,.txt,text/markdown"
      @change="handleMarkdownFileChange"
    />

    <div class="flex flex-col gap-2">
      <h2 class="text-base text-ink">
        {{ t("workspaces") }}
      </h2>

      <MediumButton class="self-start" type="button" @click="openCreateDialog">
        <Plus :size="16" :stroke-width="1.5" aria-hidden="true" />
        <span>{{ t("newWorkspace") }}</span>
      </MediumButton>
    </div>

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
          :sessions="state.sessionsByWorkspaceId[workspace.id] ?? []"
          :preview-limit="5"
          @trash="handleTrashWorkspace(workspace)"
          @update-title="handleUpdateWorkspaceTitle(workspace, $event)"
        />
      </li>
    </ul>

    <WorkspaceCreateDialog
      v-if="createDialogOpen"
      :creating="creating"
      :error="createError"
      @close="closeCreateDialog"
      @create="createWorkspace"
    />
  </PageLayout>
</template>
