<script setup lang="ts">
import { ArrowUp, Folder, RefreshCw, X } from "@lucide/vue"
import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import MediumButton from "../../../components/buttons/MediumButton.vue"
import { homeMessages } from "../Home.i18n"

const props = defineProps<{
  creating: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  create: [options: { name: string; root: string }]
}>()

const { t } = useI18n({
  messages: homeMessages,
  useScope: "local",
})

const fileSystem = makeFileSystemClient({
  baseUrl: "/api/fs",
})

const currentDirectory = ref("")
const directories = ref<Array<FileSystemEntry>>([])
const loading = ref(false)
const loadError = ref<string | undefined>(undefined)
const name = ref("")

const canCreate = computed(
  () =>
    name.value.trim() !== "" &&
    currentDirectory.value !== "" &&
    !props.creating,
)
const canGoParent = computed(
  () =>
    currentDirectory.value !== "" &&
    parentDirectory(currentDirectory.value) !== currentDirectory.value,
)

async function loadDirectory(path: string): Promise<void> {
  loading.value = true
  loadError.value = undefined

  try {
    const entries = await fileSystem.listEntries(path)

    currentDirectory.value = path
    directories.value = entries.filter((entry) => entry.kind === "Directory")
    name.value = pathName(path)
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  } finally {
    loading.value = false
  }
}

async function goParent(): Promise<void> {
  if (!canGoParent.value) return

  await loadDirectory(parentDirectory(currentDirectory.value))
}

async function refresh(): Promise<void> {
  if (currentDirectory.value === "") return

  await loadDirectory(currentDirectory.value)
}

function submit(): void {
  if (!canCreate.value) return

  emit("create", {
    name: name.value.trim(),
    root: currentDirectory.value,
  })
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return
  if (props.creating) return

  emit("close")
}

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown)

  try {
    await loadDirectory(await fileSystem.home())
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : String(error)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown)
})

function normalizePath(path: string): string {
  if (path === "/") return path

  return path.replace(/[/\\]+$/, "")
}

function parentDirectory(path: string): string {
  const normalized = normalizePath(path)
  const index = Math.max(
    normalized.lastIndexOf("/"),
    normalized.lastIndexOf("\\"),
  )

  if (index === -1) return normalized
  if (index === 0) return "/"
  if (index === 2 && /^[A-Za-z]:/.test(normalized)) {
    return normalized.slice(0, 3)
  }

  return normalized.slice(0, index)
}

function pathName(path: string): string {
  const normalized = normalizePath(path)
  const index = Math.max(
    normalized.lastIndexOf("/"),
    normalized.lastIndexOf("\\"),
  )

  if (index === -1) return normalized
  return normalized.slice(index + 1) || "/"
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4"
    @click.self="!props.creating && emit('close')"
  >
    <form
      class="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-line bg-paper text-ink"
      @submit.prevent="submit"
    >
      <header
        class="flex shrink-0 items-center justify-between border-b border-line px-4 py-3"
      >
        <h2 class="text-base">
          {{ t("createWorkspace") }}
        </h2>

        <button
          class="rounded p-1 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-50"
          type="button"
          :disabled="props.creating"
          :aria-label="t('close')"
          :title="t('close')"
          @click="emit('close')"
        >
          <X :size="18" :stroke-width="1.5" aria-hidden="true" />
        </button>
      </header>

      <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
        <div class="flex items-center gap-2 rounded bg-paper-deep px-3 py-2">
          <Folder
            class="shrink-0 text-ink-muted"
            :size="16"
            :stroke-width="1.5"
            aria-hidden="true"
          />
          <span class="truncate font-mono text-sm">
            {{ currentDirectory }}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <MediumButton
            type="button"
            :disabled="!canGoParent"
            @click="goParent"
          >
            <ArrowUp :size="16" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t("up") }}</span>
          </MediumButton>

          <MediumButton type="button" @click="refresh">
            <RefreshCw :size="16" :stroke-width="1.5" aria-hidden="true" />
            <span>{{ t("refresh") }}</span>
          </MediumButton>
        </div>

        <div class="h-64 shrink-0 overflow-y-auto rounded border border-line">
          <p v-if="loading" class="px-3 py-2 text-ink-muted">
            {{ t("loading") }}
          </p>

          <p v-else-if="loadError !== undefined" class="px-3 py-2 text-danger">
            {{ loadError }}
          </p>

          <p
            v-else-if="directories.length === 0"
            class="px-3 py-2 text-ink-muted"
          >
            {{ t("emptyDirectory") }}
          </p>

          <ul v-else class="flex flex-col">
            <li v-for="entry in directories" :key="entry.path">
              <button
                class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-paper-deep"
                type="button"
                @click="loadDirectory(entry.path)"
              >
                <Folder
                  class="shrink-0 text-ink-muted"
                  :size="16"
                  :stroke-width="1.5"
                  aria-hidden="true"
                />
                <span class="truncate">{{ entry.name }}</span>
              </button>
            </li>
          </ul>
        </div>

        <label class="flex flex-col gap-1 text-sm">
          <span class="text-ink-muted">{{ t("name") }}</span>
          <input
            v-model="name"
            class="w-full rounded border border-line bg-transparent px-2 py-1.5 text-ink outline-none placeholder:text-ink-muted"
            type="text"
          />
        </label>

        <p v-if="props.error !== undefined" class="text-sm text-danger">
          {{ props.error }}
        </p>
      </div>

      <footer
        class="flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-3"
      >
        <MediumButton
          type="button"
          :disabled="props.creating"
          @click="emit('close')"
        >
          {{ t("cancel") }}
        </MediumButton>

        <MediumButton type="submit" :disabled="!canCreate">
          {{ props.creating ? t("creating") : t("create") }}
        </MediumButton>
      </footer>
    </form>
  </div>
</template>
