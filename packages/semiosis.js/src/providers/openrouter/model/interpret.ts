import type {
  ChatCompletionInput,
  Client,
  Message,
  Tool,
} from "../client/index.ts"
import {
  AssistantSign,
  ProviderDataSign,
  ReasoningSign,
  ToolCallSign,
  isAssistantSign,
  isPersonaSign,
  isProviderDataSign,
  isReasoningSign,
  isToolCallSign,
  isToolOutputSign,
  isToolSign,
  isUserSign,
  type Sign,
  type ToolSign,
} from "../../../sign/index.ts"
import type { ModelConfig } from "./ModelConfig.ts"

export async function interpret(
  client: Client,
  config: ModelConfig,
  input: Array<Sign>,
): Promise<Array<Sign>> {
  const request: ChatCompletionInput = {
    model: config.name,
    messages: Array.from(parseMessage(input)),
    tools: input.filter(isToolSign).map(makeTool),
  }

  if (config.reasoning !== undefined) {
    request.reasoning = config.reasoning
  }

  if (config.provider !== undefined) {
    request.provider = config.provider
  }

  if (config.extraBody !== undefined) {
    request.extraBody = config.extraBody
  }

  const output = await client.chatCompletion(request)
  const message = output.choices?.[0]?.message

  if (message === undefined) {
    throw new Error("[interpret] output.choices[0].message is missing")
  }

  return makeOutputSigns(message)
}

function* parseMessage(signs: Array<Sign>): Generator<Message> {
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
      let reasoningDetails: Array<unknown> | undefined
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
        } else if (isProviderDataSign(part)) {
          if (
            part.provider === "openrouter" &&
            part.field === "reasoning_details" &&
            Array.isArray(part.data)
          ) {
            reasoningDetails = part.data
          }
        } else if (isAssistantSign(part)) {
          content += part.content
        } else if (isToolCallSign(part)) {
          toolCalls.push(part)
        }

        index += 1
      }

      const message: Message = {
        role: "assistant",
        content,
      }

      if (reasoningDetails !== undefined) {
        message.reasoning_details = reasoningDetails
      } else if (reasoning !== "") {
        message.reasoning = reasoning
      }

      if (toolCalls.length !== 0) {
        message.tool_calls = toolCalls.map(makeToolCall)
      }

      yield message
      continue
    }

    yield makeMessage(sign)
    index += 1
  }
}

function isAssistantPartSign(
  sign: Sign,
): sign is ReasoningSign | AssistantSign | ProviderDataSign | ToolCallSign {
  return (
    isReasoningSign(sign) ||
    isAssistantSign(sign) ||
    isProviderDataSign(sign) ||
    isToolCallSign(sign)
  )
}

function makeMessage(sign: Sign): Message {
  if (isPersonaSign(sign)) {
    return { role: "system", content: sign.content }
  }

  if (isUserSign(sign)) {
    return { role: "user", content: sign.content }
  }

  if (isToolOutputSign(sign)) {
    return {
      role: "tool",
      tool_call_id: sign.callId,
      content: sign.content,
    }
  }

  if (
    isReasoningSign(sign) ||
    isAssistantSign(sign) ||
    isProviderDataSign(sign) ||
    isToolCallSign(sign) ||
    isToolSign(sign)
  ) {
    throw new Error(`[interpret] unexpected message sign: ${sign.kind}`)
  }

  throw new Error(`[interpret] cannot send ${sign.kind}`)
}

function makeOutputSigns(message: Message): Array<Sign> {
  const signs: Array<Sign> = []

  if (
    message.reasoning !== undefined &&
    message.reasoning !== null &&
    message.reasoning !== ""
  ) {
    signs.push(ReasoningSign(message.reasoning))
  }

  if (
    message.reasoning_details !== undefined &&
    message.reasoning_details !== null &&
    message.reasoning_details.length !== 0
  ) {
    signs.push(
      ProviderDataSign({
        provider: "openrouter",
        field: "reasoning_details",
        data: message.reasoning_details,
      }),
    )
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
        callId: toolCall.id,
        name: toolCall.function.name,
        arguments: toolCall.function.arguments,
      }),
    )
  }

  return signs
}

function makeTool(sign: ToolSign): Tool {
  return {
    type: "function",
    function: {
      name: sign.name,
      description: sign.description,
      parameters: sign.parameters,
    },
  }
}

function makeToolCall(toolCall: ToolCallSign) {
  return {
    id: toolCall.callId,
    type: "function" as const,
    function: {
      name: toolCall.name,
      arguments: toolCall.arguments,
    },
  }
}
