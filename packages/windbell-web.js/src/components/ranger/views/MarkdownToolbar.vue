<script setup lang="ts">
import { Code, Eye } from "@lucide/vue"
import { useI18n } from "vue-i18n"
import RoundButton from "../../buttons/RoundButton.vue"
import { rangerMessages } from "../Ranger.i18n"
import type { MarkdownViewMode } from "./MarkdownViewMode"

const props = defineProps<{
  mode: MarkdownViewMode
}>()

const emit = defineEmits<{
  toggle: []
}>()

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})
</script>

<template>
  <div class="pointer-events-none flex items-center">
    <RoundButton
      type="button"
      :active="props.mode === 'source'"
      :aria-pressed="props.mode === 'source'"
      :title="props.mode === 'render' ? t('showSource') : t('showRender')"
      @click="emit('toggle')"
    >
      <Code
        v-if="props.mode === 'render'"
        :size="18"
        :stroke-width="1.5"
        aria-hidden="true"
      />
      <Eye v-else :size="18" :stroke-width="1.5" aria-hidden="true" />
      <span class="sr-only">
        {{ props.mode === "render" ? t("showSource") : t("showRender") }}
      </span>
    </RoundButton>
  </div>
</template>
