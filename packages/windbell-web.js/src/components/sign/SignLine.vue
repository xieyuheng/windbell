<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { signMessages } from "./Sign.i18n"
import { signBody } from "./signBody"
import { resolveSignView } from "./views/registry"

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
  <div class="flex min-w-0 items-center gap-2">
    <span
      class="shrink-0 rounded px-1 py-px text-ink"
      :style="{ backgroundColor: view.color }"
    >
      {{ t(view.labelKey) }}
    </span>

    <span class="truncate">
      {{ signBody(sign) }}
    </span>
  </div>
</template>
