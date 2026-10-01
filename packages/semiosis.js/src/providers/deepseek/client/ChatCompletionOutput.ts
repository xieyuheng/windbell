import type { Message } from "./Message.ts"

export type ChatCompletionOutput = {
  choices: Array<{
    message: Message
  }>
}
