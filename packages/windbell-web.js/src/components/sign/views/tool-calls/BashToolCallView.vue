<script setup lang="ts">
import type * as S from "@xieyuheng/semiosis.js"
import { bashToolParameters } from "@xieyuheng/semiosis.js/src/tools/bash/makeBashToolSign.ts"
import { Ajv } from "ajv"
import { computed } from "vue"
import type { SignState } from "../../signState.ts"

const props = defineProps<{
  sign: S.ToolCallSign
  args: unknown
  state: SignState
}>()

type BashArguments = {
  command: string
}

const ajv = new Ajv({
  allErrors: true,
  strict: false,
})

const validate = ajv.compile(bashToolParameters)

const bashArgs = computed<BashArguments>(() => {
  if (!validate(props.args)) {
    const message = (validate.errors ?? [])
      .map((error) => `${error.instancePath} ${error.message}`.trim())
      .join("; ")

    throw new Error(`[BashToolCallView] invalid arguments: ${message}`)
  }

  return props.args as BashArguments
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="font-mono text-ink-muted">
      {{ sign.name }}
    </div>

    <div class="thin-scrollbar overflow-x-auto whitespace-pre font-mono">
      <div v-if="state.workspaceRoot">
        {{ `  ${state.workspaceRoot}` }}
      </div>

      <div>$ {{ bashArgs.command }}</div>
    </div>
  </div>
</template>
