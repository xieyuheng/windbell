<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"

defineProps<{
  sessions: Array<S.SessionIndex>
  activeSessionId?: S.SessionId | null
}>()

defineEmits<{
  (event: "select", sessionId: S.SessionId): void
}>()
</script>

<template>
  <div class="flex flex-col gap-0.5 pl-4">
    <button
      v-for="session in sessions"
      :key="session.id"
      type="button"
      class="truncate rounded px-2 py-1.5 text-left text-sm transition-colors"
      :class="
        session.id === activeSessionId
          ? 'bg-paper-deep text-ink'
          : 'text-ink hover:bg-paper-deep'
      "
      @click="$emit('select', session.id)"
    >
      {{ session.title }}
    </button>
  </div>
</template>
