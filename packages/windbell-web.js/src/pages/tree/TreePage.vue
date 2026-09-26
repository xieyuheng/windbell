<script setup lang="ts">
import { useHead } from "@unhead/vue"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import BackButton from "../../components/buttons/BackButton.vue"
import { treeMessages } from "./Tree.i18n"

const route = useRoute()
const workspaceId = computed(() => String(route.params.workspaceId ?? ""))

const { t } = useI18n({
  messages: treeMessages,
  useScope: "local",
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
  </main>
</template>
