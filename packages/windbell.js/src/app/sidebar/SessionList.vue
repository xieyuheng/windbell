<script setup lang="ts">
import type { Session, SessionId } from "../../models/Session"

defineProps<{
  sessions: Array<Session>
  activeSessionId?: SessionId | null
}>()

defineEmits<{
  (event: "select", sessionId: SessionId): void
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
          ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900'
      "
      @click="$emit('select', session.id)"
    >
      {{ session.title }}
    </button>
  </div>
</template>
