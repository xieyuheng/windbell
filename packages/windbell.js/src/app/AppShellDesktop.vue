<script setup lang="ts">
import { RouterView } from "vue-router"
import AppHeader from "./AppHeader.vue"
import WorkspaceManager from "./sidebar/WorkspaceManager.vue"
</script>

<template>
  <div
    data-shell="desktop"
    class="flex min-h-screen flex-col bg-white transition-colors dark:bg-neutral-950"
  >
    <AppHeader />

    <div class="flex min-h-0 flex-1">
      <aside
        class="hidden w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 md:flex"
      >
        <WorkspaceManager />
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <RouterView />
      </div>
    </div>
  </div>
</template>
