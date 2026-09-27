import type { Model } from "../model/index.ts"
import { isAssistantSign, UserSign, type Sign } from "../sign/index.ts"

export type GenerateTitleOptions = {
  model: Model
  context: Array<Sign>
}

export async function generateTitle(
  options: GenerateTitleOptions,
): Promise<string> {
  const output = await options.model.interpret([
    ...options.context,
    UserSign(
      "Generate a short title that summarizes the conversation above. Use the conversation's language. Reply with the title only.",
    ),
  ])

  const assistantSign = output.find(isAssistantSign)
  if (assistantSign === undefined) return ""

  return assistantSign.content
}
