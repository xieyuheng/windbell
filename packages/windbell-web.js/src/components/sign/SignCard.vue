<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Card from "../card/Card.vue"
import Markdown from "../markdown/Markdown.vue"
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
const body = computed(() => signBody(props.sign))
const markdown = computed(() => config.value.markdown === true)
</script>

<template>
  <Card as="li" :color="config.color">
    <template #tag>
      <p class="tracking-wide">
        {{ t(config.labelKey) }}
      </p>
    </template>

    <div class="px-3 py-2">
      <Markdown v-if="markdown" :text="body" />
      <p v-else class="whitespace-pre-wrap">
        {{ body }}
      </p>
    </div>
  </Card>
</template>
