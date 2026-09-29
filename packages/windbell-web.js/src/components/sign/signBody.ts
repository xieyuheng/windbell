import type * as S from "@xieyuheng/semiosis.js"

export function signBody(sign: S.Sign): string {
  switch (sign.kind) {
    case "PersonaSign":
    case "UserSign":
    case "ReasoningSign":
    case "AssistantSign": {
      return sign.content
    }

    case "ToolSign": {
      return sign.name
    }

    case "ToolCallSign": {
      return `${sign.name} ${sign.arguments}`
    }

    case "ToolOutputSign": {
      return sign.content
    }

    case "ErrorSign": {
      return sign.message
    }
  }
}
