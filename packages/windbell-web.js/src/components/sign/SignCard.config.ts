import type * as S from "@xieyuheng/semiosis.js"

export type SignCardConfig = {
  labelKey: string
  color: string
}

export const signCardConfig = {
  PersonaSign: {
    labelKey: "signKind.persona",
    color: "var(--color-sign-persona)",
  },
  UserSign: {
    labelKey: "signKind.user",
    color: "var(--color-sign-user)",
  },
  ReasoningSign: {
    labelKey: "signKind.reasoning",
    color: "var(--color-sign-reasoning)",
  },
  AssistantSign: {
    labelKey: "signKind.assistant",
    color: "var(--color-sign-assistant)",
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
} satisfies Record<S.Sign["kind"], SignCardConfig>
