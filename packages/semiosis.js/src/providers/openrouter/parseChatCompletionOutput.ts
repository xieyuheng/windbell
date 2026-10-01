import { z } from "zod"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"

const toolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
})

const messageSchema = z.object({
  role: z.union([
    z.literal("system"),
    z.literal("user"),
    z.literal("assistant"),
    z.literal("tool"),
  ]),
  content: z.string().nullable().optional(),
  reasoning: z.string().nullable().optional(),
  reasoning_details: z.array(z.unknown()).nullable().optional(),
  tool_calls: z.array(toolCallSchema).nullable().optional(),
  tool_call_id: z.string().optional(),
})

const chatCompletionOutputSchema = z.object({
  choices: z.array(
    z.object({
      message: messageSchema,
    }),
  ),
})

export function parseChatCompletionOutput(text: string): ChatCompletionOutput {
  const value = parseJson(text)
  const result = chatCompletionOutputSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseChatCompletionOutput] invalid output: ${result.error.message}`,
    )
  }

  return result.data
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[parseChatCompletionOutput] invalid JSON: ${message}`)
  }
}
