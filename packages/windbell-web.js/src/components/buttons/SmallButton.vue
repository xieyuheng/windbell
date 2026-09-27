<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset"
    tone?: "default" | "danger"
    disabled?: boolean
  }>(),
  {
    type: "button",
    tone: "default",
  },
)
</script>

<template>
  <button
    class="inline-flex items-center gap-1 rounded px-px py-px text-sm transition-colors hover:bg-paper/60 disabled:pointer-events-none disabled:opacity-50"
    :class="props.tone === 'danger' ? 'hover:text-danger' : 'hover:text-ink'"
    :type="props.type"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>
