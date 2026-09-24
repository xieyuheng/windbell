<script setup lang="ts">
import { RouterView } from "vue-router"
import WorkspaceManager from "./sidebar/WorkspaceManager.vue"
</script>

<template>
  <div
    data-shell="desktop"
    class="flex h-screen min-h-0 flex-col overflow-hidden bg-paper transition-colors"
  >
    <div class="flex min-h-0 flex-1">
      <aside class="hidden w-64 shrink-0 border-r border-line md:flex">
        <WorkspaceManager />
      </aside>

      <div class="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
