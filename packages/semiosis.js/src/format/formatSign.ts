import type { Sign } from "../sign/index.ts"

export function formatSign(sign: Sign): string {
  switch (sign.kind) {
    case "PersonaSign": {
      return `[persona]\n\n${sign.content}\n`
    }

    case "UserSign": {
      return `[user]\n\n${sign.content}\n`
    }

    case "ReasoningSign": {
      return `[reasoning]\n\n${sign.content}\n`
    }

    case "AssistantSign": {
      return `[assistant]\n\n${sign.content}\n`
    }

    case "ToolCallSign": {
      const args = JSON.stringify(JSON.parse(sign.arguments), null, 2)
      return `[tool-call]\n\n${sign.name}\n\n${args}\n`
    }

    case "ToolSign": {
      const parameters = JSON.stringify(sign.parameters, null, 2)
      return `[tool]\n\n${sign.name}\n\n${sign.description}\n\n${parameters}\n`
    }

    case "ToolOutputSign": {
      return `[tool-output]\n\n${sign.content}\n`
    }

    case "ErrorSign": {
      return `[error]\n\n${sign.message}\n`
    }
  }
}
