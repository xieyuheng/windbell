import * as Readline from "node:readline"

export async function readLine(prompt: string): Promise<string> {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const line = await new Promise<string>((resolve) => {
    readline.question(prompt, resolve)
  })

  readline.close()
  return line
}
