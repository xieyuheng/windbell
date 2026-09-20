<script setup lang="ts">
import { RouterView } from "vue-router"
import AppHeader from "./AppHeader.vue"
</script>

<template>
  <div
    data-shell="desktop"
    class="flex min-h-screen flex-col bg-white text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100"
  >
    <AppHeader />
    <RouterView />
  </div>
</template>
