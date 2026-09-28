<script setup lang="ts">
import type { ListItem } from "mdast"
import { computed } from "vue"
import MarkdownNode from "../MarkdownNode.vue"
import type { MarkdownState } from "../markdownState"

const props = defineProps<{
  node: ListItem
  state: MarkdownState
  marker: string
}>()

const task = computed(
  () => props.node.checked === true || props.node.checked === false,
)

const markerSize = computed(() => `${props.marker.length}ch`)
</script>

<template>
  <li
    class="markdown-list-item"
    :class="task ? 'flex items-start gap-2' : ''"
    :style="{ '--marker-size': markerSize }"
  >
    <span class="markdown-list-marker" aria-hidden="true">
      {{ marker }}
    </span>

    <template v-if="task">
      <input
        class="mt-1 accent-ink"
        type="checkbox"
        disabled
        :checked="node.checked === true"
      />
      <div class="min-w-0 flex-1">
        <MarkdownNode
          v-for="(child, index) in node.children"
          :key="index"
          :node="child"
          :state="state"
        />
      </div>
    </template>

    <template v-else>
      <MarkdownNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
        :state="state"
      />
    </template>
  </li>
</template>
