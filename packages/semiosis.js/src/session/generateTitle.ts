import type { Model } from "../model/index.ts"
import { isAssistantSign, UserSign, type Sign } from "../sign/index.ts"

export type GenerateTitleOptions = {
  model: Model
  context: Array<Sign>
}

export type GenerateTitleResult =
  | { kind: "ok"; title: string }
  | { kind: "empty" }
  | { kind: "error"; error: unknown }

export async function generateTitle(
  options: GenerateTitleOptions,
): Promise<GenerateTitleResult> {
  try {
    const output = await options.model.interpret([
      ...options.context,
      UserSign(
        "Generate a short title that summarizes the conversation above. Use the conversation's language. Reply with the title only.",
      ),
    ])

    const assistantSign = output.find(isAssistantSign)
    if (assistantSign === undefined) {
      return { kind: "empty" }
    }

    const title = assistantSign.content.trim()
    if (title === "") {
      return { kind: "empty" }
    }

    return { kind: "ok", title }
  } catch (error) {
    return { kind: "error", error }
  }
}
