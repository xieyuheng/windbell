<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import Composer from "../../components/composer/Composer.vue"
import { workspaceMessages } from "./Workspace.i18n.ts"

const props = defineProps<{
  creating: boolean
}>()

const emit = defineEmits<{
  create: [content: string]
}>()

const { t } = useI18n({
  messages: workspaceMessages,
  useScope: "local",
})

const content = ref("")
const canSubmit = computed(() => content.value.trim() !== "" && !props.creating)

function submit(): void {
  if (!canSubmit.value) return

  emit("create", content.value.trim())
}
</script>

<template>
  <Composer
    v-model="content"
    :collapsible="false"
    :disabled="props.creating"
    :submit-disabled="!canSubmit"
    :submitting="props.creating"
    :placeholder="t('newSessionPlaceholder')"
    :submit-label="t('startSession')"
    :submitting-label="t('startingSession')"
    :collapse-on-submit="false"
    max-height="min(60dvh, 32rem)"
    @submit="submit"
  />
</template>
