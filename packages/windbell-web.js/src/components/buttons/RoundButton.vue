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
    class="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line/60 bg-paper/30 text-ink backdrop-blur transition-colors disabled:pointer-events-none disabled:opacity-50"
    :class="{
      'bg-sign-user/30'  : props.active
    }"
    :type="props.type"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>
