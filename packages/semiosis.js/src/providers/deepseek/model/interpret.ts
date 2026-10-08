import type {
  ChatCompletionInput,
  Client,
  Message,
  Tool,
} from "../client/index.ts"
import {
  AssistantSign,
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
    thinking: {
      type: config.thinking,
    },
    reasoning_effort:
      config.thinking === "enabled" ? config.reasoningEffort : "none",
  }

  const output = await client.chat.completions.create(request)
  const message = output.choices[0].message

  return makeOutputSigns(message)
}

function* parseMessage(signs: Array<Sign>): Generator<Message> {
  let index = 0

  while (index < signs.length) {
    const sign = signs[index]
    if (sign === undefined) break

    if (isProviderDataSign(sign)) {
      index += 1
      continue
    }

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

        if (isProviderDataSign(part)) {
          index += 1
          continue
        }

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

      const message: Message = {
        role: "assistant",
        content,
      }

      if (reasoning !== "") {
        message.reasoning_content = reasoning
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
): sign is ReasoningSign | AssistantSign | ToolCallSign {
  return isReasoningSign(sign) || isAssistantSign(sign) || isToolCallSign(sign)
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

  throw new Error(`[interpret] unexpected message sign: ${sign.kind}`)
}

function makeOutputSigns(message: Message): Array<Sign> {
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
