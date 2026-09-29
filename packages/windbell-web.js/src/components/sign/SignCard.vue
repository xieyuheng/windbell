<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import Card from "../card/Card.vue"
import { signMessages } from "./Sign.i18n.ts"
import SignView from "./SignView.vue"
import { resolveSignView } from "./views/registry.ts"

const props = defineProps<{
  sign: S.Sign
}>()

const { t } = useI18n({
  messages: signMessages,
  useScope: "local",
})

const view = computed(() => resolveSignView(props.sign))
</script>

<template>
  <Card as="li" :color="view.color">
    <template #tag>
      <p class="tracking-wide">
        {{ t(view.labelKey) }}
      </p>
    </template>

    <div class="px-3 py-2">
      <SignView :sign="sign" />
    </div>
  </Card>
</template>
