<script setup lang="ts">
import { ArrowLeft, FolderTree } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import RoundButton from "../../../components/buttons/RoundButton.vue"
import { sessionMessages } from "../Session.i18n"
import type { SessionState } from "../SessionState"

const props = defineProps<{
  state: SessionState
  rangerOpen: boolean
}>()

const emit = defineEmits<{
  back: []
  toggleRanger: []
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 z-50 flex items-center justify-between px-2"
    :style="{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }"
  >
    <RoundButton type="button" @click="emit('back')">
      <ArrowLeft :size="18" :stroke-width="1.5" aria-hidden="true" />
      <span class="sr-only">{{ t("app.back") }}</span>
    </RoundButton>

    <RoundButton
      type="button"
      :active="rangerOpen"
      :aria-pressed="rangerOpen"
      :disabled="props.state.workspaceId === ''"
      :title="rangerOpen ? t('closeRanger') : t('openRanger')"
      @click="emit('toggleRanger')"
    >
      <FolderTree :size="18" :stroke-width="1.5" aria-hidden="true" />
      <span class="sr-only">
        {{ rangerOpen ? t("closeRanger") : t("openRanger") }}
      </span>
    </RoundButton>
  </div>
</template>
