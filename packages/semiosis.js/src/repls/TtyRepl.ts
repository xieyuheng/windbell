import * as Readline from "node:readline"
import process from "node:process"
import type {
  Repl,
  ReplCommand,
  ReplCommandHandler,
  ReplInputHandler,
  ReplInputResult,
} from "../repl/Repl.ts"

export class TtyRepl implements Repl {
  readonly useColor: boolean

  private readonly readline: Readline.Interface
  private readonly isInteractive: boolean
  private readonly useBracketedPaste: boolean
  private readonly commands = new Map<string, ReplCommandHandler>()
  private readonly messages: Array<string> = []
  private readonly buffer: Array<string> = []
  private lastKey: Readline.Key | undefined = undefined
  private isPasting = false
  private isClosed = false
  private isInputEnded = false
  private isCleanedUp = false
  private pendingResolve: ((result: ReplInputResult) => void) | undefined

  constructor() {
    const input = process.stdin
    const output = process.stdout

    this.isInteractive = input.isTTY === true
    this.useBracketedPaste = this.isInteractive && output.isTTY === true
    this.useColor =
      output.isTTY === true &&
      process.env.NO_COLOR === undefined &&
      process.env.TERM !== "dumb"

    if (this.isInteractive) {
      // Register keypress before createInterface, otherwise readline emits
      // the line event before we can inspect the terminating key.
      Readline.emitKeypressEvents(input)
      input.on("keypress", this.onKeypress)
    }

    this.readline = Readline.createInterface({ input, output })
    this.readline.on("line", this.onLine)
    this.readline.on("close", this.onClose)

    if (this.useBracketedPaste) {
      process.stdout.write("\x1b[?2004h")
    }
  }

  println(message: string): void {
    process.stdout.write(`${message}\n`)
  }

  registerCommand(command: ReplCommand): void {
    this.commands.set(command.name, command.handler)
  }

  readInput(prompt: string): Promise<ReplInputResult> {
    if (this.isClosed) return Promise.resolve({ kind: "end" })

    if (this.messages.length > 0) {
      if (!this.isInputEnded) {
        this.readline.setPrompt(prompt)
        this.readline.prompt()
      }

      return Promise.resolve({
        kind: "input",
        input: this.messages.shift() as string,
      })
    }

    if (this.isInputEnded) return Promise.resolve({ kind: "end" })

    this.readline.setPrompt(prompt)
    this.readline.prompt()

    return new Promise((resolve) => {
      this.pendingResolve = resolve
    })
  }

  async run(onInput: ReplInputHandler, prompt: string): Promise<void> {
    try {
      while (true) {
        const result = await this.readInput(prompt)
        if (result.kind === "end") break

        const input = result.input
        const normalized = input.trim()
        if (normalized === "") continue

        const command = input.includes("\n")
          ? undefined
          : parseCommand(input.trimStart())

        if (command !== undefined) {
          const handler = this.commands.get(command.name)
          if (handler !== undefined) {
            await handler({
              command: command.name,
              input: command.input,
              repl: this,
            })
            continue
          }
        }

        await onInput(normalized)
      }
    } finally {
      this.close()
    }
  }

  close(): void {
    if (this.isClosed) return

    this.isClosed = true
    this.cleanup()
    this.resolvePending()
  }

  private readonly onKeypress = (_str: string, key: Readline.Key): void => {
    this.lastKey = key

    // Bracketed paste lets multi-line pasted text bypass line submission.
    if (key.name === "paste-start") {
      this.isPasting = true
    }

    if (key.name === "paste-end") {
      this.isPasting = false
    }
  }

  private readonly onLine = (line: string): void => {
    const shouldContinue =
      this.isInteractive && (this.isPasting || isNewlineKey(this.lastKey))
    this.lastKey = undefined
    this.buffer.push(line)

    if (shouldContinue) return

    const input = this.buffer.join("\n")
    this.buffer.length = 0
    this.deliver(input)
  }

  private readonly onClose = (): void => {
    this.isInputEnded = true
    this.cleanup()
    this.resolvePending()
  }

  private cleanup(): void {
    if (this.isCleanedUp) return
    this.isCleanedUp = true

    process.stdin.off("keypress", this.onKeypress)

    if (this.useBracketedPaste) {
      process.stdout.write("\x1b[?2004l")
    }

    this.readline.close()
  }

  private resolvePending(): void {
    const resolve = this.pendingResolve
    this.pendingResolve = undefined
    resolve?.({ kind: "end" })
  }

  private deliver(input: string): void {
    if (this.pendingResolve !== undefined) {
      const resolve = this.pendingResolve
      this.pendingResolve = undefined
      resolve({ kind: "input", input })
      return
    }

    this.messages.push(input)
  }
}

function parseCommand(
  input: string,
): { name: string; input: string } | undefined {
  if (!input.startsWith("/")) return undefined

  const content = input.slice(1)
  const whitespaceIndex = content.search(/\s/)

  if (whitespaceIndex === -1) {
    if (content === "") return undefined
    return { name: content, input: "" }
  }

  const name = content.slice(0, whitespaceIndex)
  if (name === "") return undefined

  return {
    name,
    input: content.slice(whitespaceIndex + 1),
  }
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

export function makeTtyRepl(): Repl {
  return new TtyRepl()
}
