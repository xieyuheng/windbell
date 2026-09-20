<script setup lang="ts">
import { RouterView } from "vue-router"
import AppHeader from "./AppHeader.vue"
</script>

<template>
  <div
    data-shell="mobile"
    class="flex min-h-screen flex-col bg-white pb-[env(safe-area-inset-bottom,0px)] text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100"
  >
    <AppHeader compact />
    <RouterView />
  </div>
</template>
