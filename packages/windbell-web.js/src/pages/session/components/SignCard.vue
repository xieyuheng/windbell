<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import BaseCard from "../../../components/BaseCard.vue"
import { sessionMessages } from "../Session.i18n"
import { signBody } from "../signBody"
import { signCardConfig } from "./SignCard.config"

const props = defineProps<{
  sign: S.Sign
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})

const config = computed(() => signCardConfig[props.sign.kind])
</script>

<template>
  <BaseCard as="li" :color="config.color">
    <template #header>
      <p class="tracking-wide">
        {{ t(config.labelKey) }}
      </p>
    </template>

    <p class="whitespace-pre-wrap leading-7 px-3 py-2">
      {{ signBody(sign) }}
    </p>
  </BaseCard>
</template>
