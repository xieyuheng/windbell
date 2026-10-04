import { spawn } from "node:child_process"
import process from "node:process"
import { StringDecoder } from "node:string_decoder"
import type { ToolHandler } from "../../tool/index.ts"
import { resolvePwshPath } from "./resolvePwshPath.ts"

const encodingPreamble =
  "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); " +
  "$OutputEncoding = [System.Text.UTF8Encoding]::new($false); "

const envOverrides = {
  NO_COLOR: "1",
  PAGER: "cat",
  GIT_PAGER: "cat",
}

type PwshRunOptions = {
  cwd: string
  timeoutMs: number
  maxOutputChars: number
  executable?: string
}

type PwshRunResult = {
  exitCode: number | null
  signal: NodeJS.Signals | null
  stdout: string
  stderr: string
  stdoutTruncated: boolean
  stderrTruncated: boolean
  timedOut: boolean
}

export type PwshToolHandlerOptions = {
  cwd: string
  timeoutMs: number
  maxOutputChars: number
  executable?: string
}

export function makePwshToolHandler(
  options: PwshToolHandlerOptions,
): ToolHandler {
  return async (args) => {
    const command = args.command as string

    const result = await pwshRun(command, {
      cwd: options.cwd,
      timeoutMs: options.timeoutMs,
      maxOutputChars: options.maxOutputChars,
      executable: options.executable,
    })

    return formatPwshRunResult(result, options.timeoutMs)
  }
}

function pwshRun(
  command: string,
  options: PwshRunOptions,
): Promise<PwshRunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      resolvePwshPath(options.executable),
      [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `${encodingPreamble}${command}`,
      ],
      {
        cwd: options.cwd,
        env: {
          ...process.env,
          ...envOverrides,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    )

    let stdout = ""
    let stderr = ""
    let stdoutTruncated = false
    let stderrTruncated = false
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, options.timeoutMs)

    const appendStdout = (text: string): void => {
      if (stdoutTruncated) return
      const remaining = options.maxOutputChars - stdout.length
      if (text.length > remaining) {
        stdout += text.slice(0, Math.max(remaining, 0))
        stdoutTruncated = true
      } else {
        stdout += text
      }
    }

    const appendStderr = (text: string): void => {
      if (stderrTruncated) return
      const remaining = options.maxOutputChars - stderr.length
      if (text.length > remaining) {
        stderr += text.slice(0, Math.max(remaining, 0))
        stderrTruncated = true
      } else {
        stderr += text
      }
    }

    const stdoutDecoder = new StringDecoder("utf8")
    const stderrDecoder = new StringDecoder("utf8")

    child.stdout.on("data", (chunk: Buffer) => {
      appendStdout(stdoutDecoder.write(chunk))
    })

    child.stderr.on("data", (chunk: Buffer) => {
      appendStderr(stderrDecoder.write(chunk))
    })

    child.on("error", (error) => {
      clearTimeout(timer)
      reject(error)
    })

    child.on("close", (code, signal) => {
      clearTimeout(timer)
      appendStdout(stdoutDecoder.end())
      appendStderr(stderrDecoder.end())
      resolve({
        exitCode: code,
        signal,
        stdout,
        stderr,
        stdoutTruncated,
        stderrTruncated,
        timedOut,
      })
    })
  })
}

function formatPwshRunResult(result: PwshRunResult, timeoutMs: number): string {
  const lines: Array<string> = []

  if (result.timedOut) {
    lines.push(`[timeout ${timeoutMs}ms]`)
  }

  if (result.exitCode !== 0) {
    lines.push(`[exit-code ${result.exitCode}]`)
  }

  if (result.signal) {
    lines.push(`[signal ${result.signal}]`)
  }

  lines.push(truncatedText(result.stdout, result.stdoutTruncated))

  if (result.stderr !== "") {
    lines.push("[stderr]")
    lines.push(truncatedText(result.stderr, result.stderrTruncated))
  }

  return lines.join("\n")
}

function truncatedText(text: string, truncated: boolean): string {
  if (!truncated) return text
  return `${text}\n[output-truncated]`
}
