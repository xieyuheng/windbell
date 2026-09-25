<script setup lang="ts">
import BackButton from "./BackButton.vue"
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <BackButton
      class="inline-flex items-center gap-2 rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-deep"
    />
    <slot />
  </div>
</template>
