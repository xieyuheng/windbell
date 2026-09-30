export type ReplCommandContext = {
  command: string
  input: string
}

export type ReplCommandHandler = (
  context: ReplCommandContext,
) => Promise<void> | void

export type ReplCommand = {
  name: string
  handler: ReplCommandHandler
}

export type ReplInputHandler = (input: string) => Promise<void> | void

export type ReplInputResult = { kind: "input"; input: string } | { kind: "end" }

export type Repl = {
  readonly useColor: boolean

  println(message: string): void
  registerCommand(command: ReplCommand): void
  tryDispatchCommand(input: string): Promise<boolean>
  readInput(prompt: string): Promise<ReplInputResult>
  run(onInput: ReplInputHandler, prompt: string): Promise<void>
  close(): void
}
