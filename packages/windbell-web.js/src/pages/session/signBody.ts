import type * as S from "@xieyuheng/semiosis.js"

export function signBody(sign: S.Sign): string {
  switch (sign.kind) {
    case "UserSign":
    case "ReasoningSign":
    case "AssistantSign":
    case "ToolOutputSign":
    case "PersonaSign":
      return sign.content
    case "ToolCallSign":
      return `${sign.name} ${sign.arguments}`
    case "ToolSign":
      return sign.name
    case "ErrorSign":
      return sign.message
  }
}
