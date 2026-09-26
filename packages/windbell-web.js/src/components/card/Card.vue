<script setup lang="ts">
import type { Component } from "vue"

const props = withDefaults(
  defineProps<{
    as?: string | Component
    color?: string
  }>(),
  {
    as: "div",
    color: "var(--color-paper-deep)",
  },
)
</script>

<template>
  <component
    :is="props.as"
    class="block overflow-hidden rounded-lg border-x-3 border-[var(--card-color)]"
    :class="{ 'border-b-3': !$slots.footer }"
    :style="{ '--card-color': props.color }"
  >
    <header class="bg-[var(--card-color)] px-3 py-2">
      <slot name="header" />
    </header>

    <slot />

    <footer v-if="$slots.footer" class="bg-[var(--card-color)] px-3 py-1">
      <slot name="footer" />
    </footer>
  </component>
</template>
