import { z } from "zod"
import type { OpenRouterChatCompletionOutput } from "./OpenRouterChatCompletionOutput.ts"

const openRouterToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
})

const openRouterMessageSchema = z.object({
  role: z.union([
    z.literal("system"),
    z.literal("user"),
    z.literal("assistant"),
    z.literal("tool"),
  ]),
  content: z.string().nullable().optional(),
  reasoning: z.string().nullable().optional(),
  reasoning_details: z.array(z.unknown()).nullable().optional(),
  tool_calls: z.array(openRouterToolCallSchema).nullable().optional(),
  tool_call_id: z.string().optional(),
})

const openRouterChatCompletionOutputSchema = z.object({
  choices: z.array(
    z.object({
      message: openRouterMessageSchema,
    }),
  ),
})

export function parseOpenRouterChatCompletionOutput(
  text: string,
): OpenRouterChatCompletionOutput {
  const value = parseOpenRouterJson(text)
  const result = openRouterChatCompletionOutputSchema.safeParse(value)
  if (!result.success) {
    throw new Error(
      `[parseOpenRouterChatCompletionOutput] invalid output: ${result.error.message}`,
    )
  }

  return result.data
}

function parseOpenRouterJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `[parseOpenRouterChatCompletionOutput] invalid JSON: ${message}`,
    )
  }
}
