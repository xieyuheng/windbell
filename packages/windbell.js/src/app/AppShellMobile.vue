<script setup lang="ts">
import { RouterView } from "vue-router"
import MobileHeader from "./MobileHeader.vue"
</script>

<template>
  <div
    data-shell="mobile"
    class="flex min-h-screen flex-col bg-paper pb-[env(safe-area-inset-bottom,0px)] text-ink transition-colors"
  >
    <MobileHeader />
    <RouterView />
  </div>
</template>
