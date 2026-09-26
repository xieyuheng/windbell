<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset"
    active?: boolean
    disabled?: boolean
  }>(),
  {
    type: "button",
    active: false,
  },
)
</script>

<template>
  <button
    class="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/60 text-ink-muted backdrop-blur transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-50"
    :class="props.active ? 'border-ink/40 bg-interactive/60 text-ink' : ''"
    :type="props.type"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>
