<script setup lang="ts">
import { Plus } from "@lucide/vue"
import { useHead } from "@unhead/vue"
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { RouterLink } from "vue-router"
import SettingsButton from "../../components/SettingsButton.vue"
import Card from "../../components/Card.vue"
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
  <main class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-6">
    <header class="flex flex-col gap-3">
      <h1 class="text-xl text-ink">
        {{ t("title") }}
      </h1>

      <div class="flex flex-wrap items-center gap-2">
        <SettingsButton />
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

    <p v-if="state.loading" class="text-ink">
      {{ t("loading") }}
    </p>

    <p v-else-if="state.error !== undefined" class="text-danger">
      {{ state.error }}
    </p>

    <ul v-else class="flex flex-col gap-4">
      <li v-for="workspace in state.workspaces" :key="workspace.id">
        <Card as="article">
          <template #header>
            <RouterLink
              class="block min-w-0"
              :to="{
                name: 'session-list',
                params: { workspaceId: workspace.id },
              }"
            >
              <h2 class="truncate text-base text-ink">
                {{ workspace.name }}
              </h2>
            </RouterLink>
          </template>

          <RouterLink
            class="block"
            :to="{
              name: 'session-list',
              params: { workspaceId: workspace.id },
            }"
          >
            <div class="px-3 py-2">
              <p class="truncate font-mono text-ink">
                {{ workspace.root }}
              </p>
            </div>
          </RouterLink>
        </Card>
      </li>
    </ul>
  </main>
</template>
