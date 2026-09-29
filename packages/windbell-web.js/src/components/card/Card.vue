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
    class="block"
    :style="{ '--card-color': props.color }"
  >
    <div v-if="$slots.tag" class="flex">
      <div class="flex py-1 rounded-t-lg bg-[var(--card-color)] px-3">
        <slot name="tag" />
      </div>
    </div>

    <div
      class="border-3 border-[var(--card-color)]"
      :class="$slots.tag ? 'rounded-b-lg rounded-tr-lg' : 'rounded-lg'"
    >
      <slot />

      <footer
        v-if="$slots.footer"
        class="border-t-3 border-dotted border-[var(--card-color)] px-3 py-1"
      >
        <slot name="footer" />
      </footer>
    </div>
  </component>
</template>
