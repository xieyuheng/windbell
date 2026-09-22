import type { Sign } from "../sign/index.ts"

export function formatSign(sign: Sign): string {
  switch (sign.kind) {
    case "PersonaSign":
      return `[persona]\n${sign.content}`
    case "UserSign":
      return `[user]\n${sign.content}`
    case "AssistantSign": {
      const lines: Array<string> = []

      if (sign.reasoning !== "") {
        lines.push("[reasoning]")
        lines.push(sign.reasoning)
        lines.push("")
      }

      lines.push("[assistant]")

      if (sign.content !== "") {
        lines.push(sign.content)
      }

      for (const toolCall of sign.toolCalls) {
        lines.push(`[tool call] ${toolCall.name} ${toolCall.arguments}`)
      }

      return lines.join("\n")
    }
    case "ToolSign":
      return `[tool result] ${sign.content}`
    case "ErrorSign":
      return sign.message
  }
}
