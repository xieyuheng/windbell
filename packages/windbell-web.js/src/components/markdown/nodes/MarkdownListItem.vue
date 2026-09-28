<script setup lang="ts">
import type { ListItem } from "mdast"
import { computed } from "vue"
import type { MarkdownState } from "../markdownState"

const props = defineProps<{
  node: ListItem
  state: MarkdownState
}>()

const task = computed(
  () => props.node.checked === true || props.node.checked === false,
)
</script>

<template>
  <li :class="task ? 'flex items-start gap-2' : ''">
    <template v-if="task">
      <input
        class="mt-1 accent-ink"
        type="checkbox"
        disabled
        :checked="node.checked === true"
      />
      <div class="min-w-0 flex-1"><slot /></div>
    </template>
    <template v-else>
      <slot />
    </template>
  </li>
</template>
