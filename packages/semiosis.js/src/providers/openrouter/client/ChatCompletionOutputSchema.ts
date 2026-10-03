import { z } from "zod"
import type { ChatCompletionOutput } from "./ChatCompletionOutput.ts"

const toolCallSchema = z.looseObject({
  id: z.string(),
  type: z.literal("function"),
  function: z.looseObject({
    name: z.string(),
    arguments: z.string(),
  }),
})

const messageSchema = z.looseObject({
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

export const chatCompletionOutputSchema: z.ZodType<ChatCompletionOutput> =
  z.looseObject({
    choices: z.array(
      z.looseObject({
        message: messageSchema,
      }),
    ),
  })
