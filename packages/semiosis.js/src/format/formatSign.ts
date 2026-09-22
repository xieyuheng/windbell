import type { Sign } from "../sign/index.ts"

export function formatSign(sign: Sign): string {
  switch (sign.kind) {
    case "PersonaSign":
      return `[persona]\n${sign.content}`
    case "UserSign":
      return `[user]\n${sign.content}`
    case "ReasoningSign":
      return `[reasoning]\n${sign.content}\n`
    case "AssistantSign": {
      const lines = ["[assistant]"]

      if (sign.content !== "") {
        lines.push(sign.content)
      }

      return lines.join("\n")
    }
    case "ToolCallSign":
      return `[tool call] ${sign.toolCall.name} ${sign.toolCall.arguments}`
    case "ToolSign":
      return [
        `[tool] ${sign.name}`,
        "",
        sign.description,
        "",
        JSON.stringify(sign.parameters, null, 2),
      ].join("\n")
    case "ToolOutputSign":
      return `[tool output] ${sign.content}`
    case "ErrorSign":
      return sign.message
  }
}
