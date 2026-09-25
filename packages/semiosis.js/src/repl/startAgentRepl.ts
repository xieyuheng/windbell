import * as Readline from "node:readline"
import process from "node:process"
import { errorReport } from "@xieyuheng/std.js/error"
import { agentInterpret, type Agent } from "../agent/index.ts"
import { formatSign, formatSignTag } from "../format/index.ts"
import { UserSign } from "../sign/index.ts"

export type StartAgentReplOptions = {
  showContext: boolean
}

function isNewlineKey(key: Readline.Key | undefined): boolean {
  if (key === undefined) return false

  // Ctrl+J and pasted newlines are LF, while Enter is usually CR.
  if (key.sequence === "\n") return true

  // Alt+Enter is usually ESC + Enter, which readline reports as meta.
  if (key.name === "enter" && key.meta === true) return true
  if (key.name === "return" && key.meta === true) return true

  return false
}

export async function startAgentRepl(
  agent: Agent,
  options: StartAgentReplOptions,
): Promise<void> {
  const isInteractive = process.stdin.isTTY === true
  const useBracketedPaste = isInteractive && process.stdout.isTTY === true
  const useColor =
    process.stdout.isTTY === true &&
    process.env.NO_COLOR === undefined &&
    process.env.TERM !== "dumb"
  const userPrompt = `${formatSignTag("UserSign", "user", { color: useColor })}\n\n`

  const messages: Array<string> = []
  const buffer: Array<string> = []
  let lastKey: Readline.Key | undefined = undefined
  let isPasting = false
  let isClosed = false
  let wake: (() => void) | undefined = undefined

  function onKeypress(_str: string, key: Readline.Key): void {
    lastKey = key

    // Bracketed paste lets multi-line pasted text bypass line submission.
    if (key.name === "paste-start") {
      isPasting = true
    }

    if (key.name === "paste-end") {
      isPasting = false
    }
  }

  if (isInteractive) {
    // Register keypress before createInterface, otherwise readline emits
    // the line event before we can inspect the terminating key.
    Readline.emitKeypressEvents(process.stdin)
    process.stdin.on("keypress", onKeypress)
  }

  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  if (useBracketedPaste) {
    process.stdout.write("\x1b[?2004h")
  }

  function renderPrompt(): void {
    if (isClosed) return

    readline.setPrompt(userPrompt)
    readline.prompt()
  }

  readline.on("line", (line) => {
    const shouldContinue = isInteractive && (isPasting || isNewlineKey(lastKey))
    lastKey = undefined
    buffer.push(line)

    if (shouldContinue) return

    messages.push(buffer.join("\n"))
    buffer.length = 0
    wake?.()
    wake = undefined
  })

  readline.on("close", () => {
    isClosed = true
    process.stdin.off("keypress", onKeypress)

    if (useBracketedPaste) {
      process.stdout.write("\x1b[?2004l")
    }
    wake?.()
    wake = undefined
  })

  if (options.showContext) {
    const context = await agent.getContext()
    for (const sign of context) {
      console.log(formatSign(sign, { color: useColor }))
    }
  }

  renderPrompt()

  while (true) {
    if (messages.length === 0) {
      if (isClosed) break
      await new Promise<void>((resolve) => {
        wake = resolve
      })
      continue
    }

    const message = messages.shift() as string
    const input = message.trim()

    if (input === "/exit") break

    if (input === "") continue

    try {
      console.log()
      for await (const sign of agentInterpret(agent, [UserSign(input)])) {
        console.log(formatSign(sign, { color: useColor }))
      }
    } catch (error) {
      console.log(errorReport(error))
    }

    renderPrompt()
  }

  readline.close()
}
