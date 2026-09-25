import type * as S from "@xieyuheng/semiosis.js"

export type SignCardConfig = {
  labelKey: string
  border: string
  bg: string
}

export const signCardConfig = {
  PersonaSign: {
    labelKey: "signKind.persona",
    border: "border-sign-persona",
    bg: "bg-sign-persona",
  },
  UserSign: {
    labelKey: "signKind.user",
    border: "border-sign-user",
    bg: "bg-sign-user",
  },
  ReasoningSign: {
    labelKey: "signKind.reasoning",
    border: "border-sign-reasoning",
    bg: "bg-sign-reasoning",
  },
  AssistantSign: {
    labelKey: "signKind.assistant",
    border: "border-sign-assistant",
    bg: "bg-sign-assistant",
  },
  ToolCallSign: {
    labelKey: "signKind.toolCall",
    border: "border-sign-tool-call",
    bg: "bg-sign-tool-call",
  },
  ToolSign: {
    labelKey: "signKind.tool",
    border: "border-sign-tool",
    bg: "bg-sign-tool",
  },
  ToolOutputSign: {
    labelKey: "signKind.toolOutput",
    border: "border-sign-tool-output",
    bg: "bg-sign-tool-output",
  },
  ErrorSign: {
    labelKey: "signKind.error",
    border: "border-sign-error",
    bg: "bg-sign-error",
  },
} satisfies Record<S.Sign["kind"], SignCardConfig>
