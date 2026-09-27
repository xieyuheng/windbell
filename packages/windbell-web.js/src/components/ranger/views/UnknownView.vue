<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { rangerMessages } from "../Ranger.i18n"

const { t } = useI18n({
  messages: rangerMessages,
  useScope: "local",
})
</script>

<template>
  <div class="flex h-full items-center justify-center px-4 text-ink">
    {{ t("unknown") }}
  </div>
</template>
