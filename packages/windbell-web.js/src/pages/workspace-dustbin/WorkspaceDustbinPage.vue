<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { useHead } from "@unhead/vue"
import PageLayout from "../../components/layout/PageLayout.vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import BackButton from "../../components/buttons/BackButton.vue"
import DustbinWorkspaceCard from "./components/DustbinWorkspaceCard.vue"
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
  <PageLayout>
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
        <DustbinWorkspaceCard
          :workspace="workspace"
          :busy="busyWorkspaceId === workspace.id"
          @restore="restore(workspace)"
          @remove="remove(workspace)"
        />
      </li>
    </ol>

    <div v-else class="flex flex-1 items-center justify-center text-ink">
      {{ t("empty") }}
    </div>
  </PageLayout>
</template>
