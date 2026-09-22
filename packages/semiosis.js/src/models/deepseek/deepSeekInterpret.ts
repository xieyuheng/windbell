import type {
  DeepSeekChatCompletionInput,
  DeepSeekClient,
  DeepSeekMessage,
  DeepSeekTool,
} from "../../clients/deepseek/index.ts"
import type { ModelInput, ModelOutput } from "../../model/index.ts"
import {
  AssistantSign,
  ReasoningSign,
  ToolCallSign,
  isAssistantSign,
  isPersonaSign,
  isReasoningSign,
  isToolCallSign,
  isToolOutputSign,
  isToolSign,
  isUserSign,
  type Sign,
  type ToolSign,
} from "../../sign/index.ts"
import type { DeepSeekModelConfig } from "./DeepSeekModelConfig.ts"

export async function deepSeekInterpret(
  client: DeepSeekClient,
  config: DeepSeekModelConfig,
  input: ModelInput,
): Promise<ModelOutput> {
  const request: DeepSeekChatCompletionInput = {
    model: config.name,
    messages: Array.from(parseDeepSeekMessage(input.context.signs)),
    tools: input.context.signs.filter(isToolSign).map(makeDeepSeekTool),
    thinking: {
      type: config.thinking,
    },
    reasoning_effort:
      config.thinking === "enabled" ? config.reasoningEffort : "none",
  }

  const output = await client.chatCompletion(request)
  const message = output.choices?.[0]?.message

  if (message === undefined) {
    throw new Error("[deepSeekInterpret] output.choices[0].message is missing")
  }

  return {
    signs: makeOutputSigns(message),
  }
}

function* parseDeepSeekMessage(signs: Array<Sign>): Generator<DeepSeekMessage> {
  let index = 0

  while (index < signs.length) {
    const sign = signs[index]
    if (sign === undefined) break

    if (isToolSign(sign)) {
      index += 1
      continue
    }

    if (isAssistantPartSign(sign)) {
      let reasoning = ""
      let content = ""
      const toolCalls: Array<ToolCallSign> = []

      while (index < signs.length) {
        const part = signs[index]
        if (part === undefined) break

        if (isToolSign(part)) {
          index += 1
          continue
        }

        if (!isAssistantPartSign(part)) break

        if (isReasoningSign(part)) {
          reasoning += part.content
        } else if (isAssistantSign(part)) {
          content += part.content
        } else if (isToolCallSign(part)) {
          toolCalls.push(part)
        }

        index += 1
      }

      const message: DeepSeekMessage = {
        role: "assistant",
        content,
      }

      if (reasoning !== "") {
        message.reasoning_content = reasoning
      }

      if (toolCalls.length !== 0) {
        message.tool_calls = toolCalls.map(makeDeepSeekToolCall)
      }

      yield message
      continue
    }

    yield makeDeepSeekMessage(sign)
    index += 1
  }
}

function isAssistantPartSign(
  sign: Sign,
): sign is ReasoningSign | AssistantSign | ToolCallSign {
  return isReasoningSign(sign) || isAssistantSign(sign) || isToolCallSign(sign)
}

function makeDeepSeekMessage(sign: Sign): DeepSeekMessage {
  if (isPersonaSign(sign)) {
    return { role: "system", content: sign.content }
  }

  if (isUserSign(sign)) {
    return { role: "user", content: sign.content }
  }

  if (isToolOutputSign(sign)) {
    return {
      role: "tool",
      tool_call_id: sign.toolCallId,
      content: sign.content,
    }
  }

  if (
    isReasoningSign(sign) ||
    isAssistantSign(sign) ||
    isToolCallSign(sign) ||
    isToolSign(sign)
  ) {
    throw new Error(`[deepSeekInterpret] unexpected message sign: ${sign.kind}`)
  }

  throw new Error(`[deepSeekInterpret] cannot send ${sign.kind}`)
}

function makeOutputSigns(message: DeepSeekMessage): Array<Sign> {
  const signs: Array<Sign> = []

  if (
    message.reasoning_content !== undefined &&
    message.reasoning_content !== null &&
    message.reasoning_content !== ""
  ) {
    signs.push(ReasoningSign(message.reasoning_content))
  }

  if (
    message.content !== undefined &&
    message.content !== null &&
    message.content !== ""
  ) {
    signs.push(AssistantSign(message.content))
  }

  for (const toolCall of message.tool_calls ?? []) {
    signs.push(
      ToolCallSign({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: toolCall.function.arguments,
      }),
    )
  }

  return signs
}

function makeDeepSeekTool(sign: ToolSign): DeepSeekTool {
  return {
    type: "function",
    function: {
      name: sign.name,
      description: sign.description,
      parameters: sign.parameters,
    },
  }
}

function makeDeepSeekToolCall(toolCall: ToolCallSign) {
  return {
    id: toolCall.id,
    type: "function" as const,
    function: {
      name: toolCall.name,
      arguments: toolCall.arguments,
    },
  }
}
