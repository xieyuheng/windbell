<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { RouterLink } from "vue-router"
import Card from "../../../components/card/Card.vue"

const props = defineProps<{
  workspace: S.Workspace
}>()

const sessionListRoute = computed(() => ({
  name: "workspace",
  params: {
    workspaceId: props.workspace.id,
  },
}))
</script>

<template>
  <Card as="article">
    <template #header>
      <RouterLink class="block min-w-0" :to="sessionListRoute">
        <h2 class="truncate text-base text-ink">
          {{ workspace.name }}
        </h2>
      </RouterLink>
    </template>

    <RouterLink class="block" :to="sessionListRoute">
      <div class="px-3 py-2">
        <p class="truncate font-mono text-ink">
          {{ workspace.root }}
        </p>
      </div>
    </RouterLink>
  </Card>
</template>
