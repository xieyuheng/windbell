import { z } from "zod"

export const ToolCallSchema = z.strictObject({
  id: z.string(),
  index: z.number().optional(),
  type: z.literal("function"),
  function: z.strictObject({
    name: z.string(),
    arguments: z.string(),
  }),
})

export type ToolCall = z.infer<typeof ToolCallSchema>
