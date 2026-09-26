<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from "vue-router"

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    type?: "button" | "submit" | "reset"
    disabled?: boolean
    tone?: "default" | "danger"
  }>(),
  {
    type: "button",
    tone: "default",
  },
)
</script>

<template>
  <RouterLink
    v-if="props.to !== undefined"
    v-bind="$attrs"
    class="inline-flex items-center gap-2 rounded border-2 px-2 py-1 transition-colors"
    :class="
      props.tone === 'danger'
        ? 'border-danger/60 text-danger hover:bg-danger/10'
        : 'border-line text-ink hover:bg-line'
    "
    :to="props.to"
  >
    <slot />
  </RouterLink>

  <button
    v-else
    v-bind="$attrs"
    class="inline-flex items-center gap-2 rounded border-2 px-2 py-1 transition-colors disabled:pointer-events-none disabled:opacity-50"
    :class="
      props.tone === 'danger'
        ? 'border-danger/60 text-danger hover:bg-danger/10'
        : 'border-line text-ink hover:bg-line'
    "
    :type="props.type"
    :disabled="props.disabled"
  >
    <slot />
  </button>
</template>
