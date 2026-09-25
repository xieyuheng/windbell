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
    class="block overflow-hidden rounded border-3 border-[var(--card-color)]"
    :style="{ '--card-color': props.color }"
  >
    <div class="bg-[var(--card-color)] px-3 py-2">
      <slot name="header" />
    </div>

    <slot />
  </component>
</template>
