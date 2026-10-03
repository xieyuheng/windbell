import { z } from "zod"
import { MessageSchema } from "./MessageSchema.ts"

const PromptTokensDetailsSchema = z.strictObject({
  cached_tokens: z.number(),
})

const CompletionTokensDetailsSchema = z.strictObject({
  reasoning_tokens: z.number(),
})

const UsageSchema = z.strictObject({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
  prompt_tokens_details: PromptTokensDetailsSchema.optional(),
  completion_tokens_details: CompletionTokensDetailsSchema.optional(),
  prompt_cache_hit_tokens: z.number().optional(),
  prompt_cache_miss_tokens: z.number().optional(),
})

const ChoiceSchema = z.strictObject({
  index: z.number(),
  message: MessageSchema,
  logprobs: z.unknown().nullable(),
  finish_reason: z.string().nullable(),
})

export const ChatCompletionOutputSchema = z.strictObject({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(ChoiceSchema),
  usage: UsageSchema,
  system_fingerprint: z.string().optional(),
})

export type ChatCompletionOutput = z.infer<typeof ChatCompletionOutputSchema>
