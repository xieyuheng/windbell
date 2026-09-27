<script setup lang="ts">
import { useWallpaper } from "../../app/wallpaper"

const wallpaper = useWallpaper()
</script>

<template>
  <div
    v-if="wallpaper.patternId !== 'none'"
    aria-hidden="true"
    class="wallpaper-layer pointer-events-none fixed inset-0 -z-10"
  />
</template>
