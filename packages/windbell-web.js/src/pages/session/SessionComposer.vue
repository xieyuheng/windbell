<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Composer from "../../components/composer/Composer.vue"
import { sessionMessages } from "./Session.i18n.ts"

const props = defineProps<{
  modelValue: string
  interpreting: boolean
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  send: []
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const input = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
})
</script>

<template>
  <Composer
    v-model="input"
    :submitting="props.interpreting"
    :placeholder="t('inputPlaceholder')"
    :submit-label="t('send')"
    :submitting-label="t('sending')"
    :collapse-on-submit="true"
    @submit="emit('send')"
  />
</template>
