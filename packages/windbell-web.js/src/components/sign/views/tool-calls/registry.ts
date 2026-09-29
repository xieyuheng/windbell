import type { Component } from "vue"
import type * as S from "@xieyuheng/semiosis.js"
import BashToolCallView from "./BashToolCallView.vue"
import DefaultToolCallView from "./DefaultToolCallView.vue"

const toolCallViews: Partial<Record<string, Component>> = {
  bash: BashToolCallView,
}

export function resolveToolCallView(sign: S.ToolCallSign): Component {
  return toolCallViews[sign.name] ?? DefaultToolCallView
}
