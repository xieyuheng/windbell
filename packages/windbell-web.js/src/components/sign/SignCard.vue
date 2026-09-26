<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Card from "../card/Card.vue"
import { signMessages } from "./Sign.i18n"
import { signBody } from "./signBody"
import { signCardConfig } from "./SignCard.config"

const props = defineProps<{
  sign: S.Sign
}>()

const { t } = useI18n({
  messages: signMessages,
  useScope: "local",
})

const config = computed(() => signCardConfig[props.sign.kind])
</script>

<template>
  <Card as="li" :color="config.color">
    <template #header>
      <p class="tracking-wide">
        {{ t(config.labelKey) }}
      </p>
    </template>

    <p class="whitespace-pre-wrap leading-7 px-3 py-2">
      {{ signBody(sign) }}
    </p>
  </Card>
</template>
