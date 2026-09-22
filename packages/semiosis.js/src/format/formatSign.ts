import type { Sign } from "../sign/index.ts"

export function formatSign(sign: Sign): string {
  switch (sign.kind) {
    case "PersonaSign": {
      return `[persona]\n${sign.content}`
    }

    case "UserSign": {
      return `[user]\n${sign.content}`
    }

    case "ReasoningSign": {
      return `[reasoning]\n${sign.content}`
    }

    case "AssistantSign": {
      return `[assistant]\n${sign.content}`
    }

    case "ToolCallSign": {
      return `[tool-call] ${sign.name}\n${sign.arguments}`
    }

    case "ToolSign": {
      return [
        `[tool] ${sign.name}`,
        sign.description,
        JSON.stringify(sign.parameters, null, 2),
      ].join("\n")
    }

    case "ToolOutputSign": {
      return `[tool-output]\n${sign.content}`
    }

    case "ErrorSign": {
      return `[error]\n${sign.message}`
    }
  }
}
