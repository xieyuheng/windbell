<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { useI18n } from "vue-i18n"
import { sessionMessages } from "../../session/Session.i18n"
import { signBody } from "../../session/signBody"
import { signCardConfig } from "../../session/components/SignCard.config"

defineProps<{
  sign: S.Sign
}>()

const { t } = useI18n({
  messages: sessionMessages,
  useScope: "local",
})
</script>

<template>
  <div class="flex min-w-0 items-center gap-2">
    <span
      class="shrink-0 rounded px-1 py-px text-ink"
      :style="{ backgroundColor: signCardConfig[sign.kind].color }"
    >
      {{ t(signCardConfig[sign.kind].labelKey) }}
    </span>

    <span class="truncate">
      {{ signBody(sign) }}
    </span>
  </div>
</template>
