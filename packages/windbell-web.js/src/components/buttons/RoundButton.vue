<script setup lang="ts">
import { computed } from "vue"

type RoundButtonVariant = "default" | "ghost" | "accent"

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset"
    active?: boolean
    disabled?: boolean
    variant?: RoundButtonVariant
  }>(),
  {
    type: "button",
    active: false,
    variant: "default",
  },
)

const buttonClasses = computed(() => {
  const baseClass =
    "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 disabled:pointer-events-none disabled:opacity-50"

  if (props.variant === "ghost") {
    return [
      baseClass,
      props.active
        ? "border border-transparent bg-sign-user/30 text-ink"
        : "border border-transparent bg-transparent text-ink/70 hover:bg-line/50 hover:text-ink",
    ]
  }

  if (props.variant === "accent") {
    return [
      baseClass,
      "border border-transparent text-ink",
      props.active ? "bg-sign-user/70" : "bg-sign-user/60 hover:scale-110",
    ]
  }

  return [
    baseClass,
    "border border-line/60 text-ink backdrop-blur",
    props.active
      ? "bg-sign-user/30 hover:border-ink/25"
      : "bg-paper/30 hover:border-ink/25 hover:bg-paper/50",
  ]
})
</script>

<template>
  <button :class="buttonClasses" :type="props.type" :disabled="props.disabled">
    <slot />
  </button>
</template>
