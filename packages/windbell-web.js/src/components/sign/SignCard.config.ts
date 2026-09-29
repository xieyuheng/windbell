import type * as S from "@xieyuheng/semiosis.js"

export type SignCardConfig = {
  labelKey: string
  color: string
  markdown?: boolean
}

export const signCardConfig: Record<S.Sign["kind"], SignCardConfig> = {
  PersonaSign: {
    labelKey: "signKind.persona",
    color: "var(--color-sign-persona)",
    markdown: true,
  },
  UserSign: {
    labelKey: "signKind.user",
    color: "var(--color-sign-user)",
    markdown: true,
  },
  ReasoningSign: {
    labelKey: "signKind.reasoning",
    color: "var(--color-sign-reasoning)",
    markdown: true,
  },
  AssistantSign: {
    labelKey: "signKind.assistant",
    color: "var(--color-sign-assistant)",
    markdown: true,
  },
  ToolCallSign: {
    labelKey: "signKind.toolCall",
    color: "var(--color-sign-tool-call)",
  },
  ToolSign: {
    labelKey: "signKind.tool",
    color: "var(--color-sign-tool)",
  },
  ToolOutputSign: {
    labelKey: "signKind.toolOutput",
    color: "var(--color-sign-tool-output)",
  },
  ErrorSign: {
    labelKey: "signKind.error",
    color: "var(--color-sign-error)",
  },
}
