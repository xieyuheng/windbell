import { spawn } from "node:child_process"
import process from "node:process"
import { StringDecoder } from "node:string_decoder"
import type { ToolHandler } from "../../tool/index.ts"
import {
  killChildProcessTree,
  useDetachedChildProcess,
} from "../killChildProcessTree.ts"
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
  signal?: AbortSignal
}

type PwshRunResult = {
  exitCode: number | null
  signal: NodeJS.Signals | null
  stdout: string
  stderr: string
  stdoutTruncated: boolean
  stderrTruncated: boolean
  timedOut: boolean
  cancelled: boolean
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
  return async (args, handlerOptions) => {
    const command = args.command as string

    const result = await pwshRun(command, {
      cwd: options.cwd,
      timeoutMs: options.timeoutMs,
      maxOutputChars: options.maxOutputChars,
      executable: options.executable,
      signal: handlerOptions.signal,
    })

    return formatPwshRunResult(result, options.timeoutMs)
  }
}

function pwshRun(
  command: string,
  options: PwshRunOptions,
): Promise<PwshRunResult> {
  if (options.signal?.aborted) {
    return Promise.resolve(cancelledPwshRunResult())
  }

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
        // POSIX process group: let cancellation kill the shell and descendants.
        detached: useDetachedChildProcess,
      },
    )

    let stdout = ""
    let stderr = ""
    let stdoutTruncated = false
    let stderrTruncated = false
    let timedOut = false
    let cancelled = false

    const onAbort = (): void => {
      cancelled = true
      killChildProcessTree(child)
    }

    const timer = setTimeout(() => {
      timedOut = true
      killChildProcessTree(child)
    }, options.timeoutMs)

    const cleanup = (): void => {
      clearTimeout(timer)
      options.signal?.removeEventListener("abort", onAbort)
    }

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
      cleanup()

      if (cancelled) {
        resolve({
          exitCode: null,
          signal: null,
          stdout,
          stderr,
          stdoutTruncated,
          stderrTruncated,
          timedOut,
          cancelled: true,
        })
        return
      }

      reject(error)
    })

    child.on("close", (code, signal) => {
      cleanup()
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
        cancelled,
      })
    })

    options.signal?.addEventListener("abort", onAbort, { once: true })

    if (options.signal?.aborted) {
      onAbort()
    }
  })
}

function cancelledPwshRunResult(): PwshRunResult {
  return {
    exitCode: null,
    signal: null,
    stdout: "",
    stderr: "",
    stdoutTruncated: false,
    stderrTruncated: false,
    timedOut: false,
    cancelled: true,
  }
}

function formatPwshRunResult(result: PwshRunResult, timeoutMs: number): string {
  const lines: Array<string> = []

  if (result.cancelled) {
    lines.push(
      "[cancelled] user aborted tool execution; it may have partially executed.",
    )
  } else {
    if (result.timedOut) {
      lines.push(`[timeout ${timeoutMs}ms]`)
    }

    if (result.exitCode !== 0) {
      lines.push(`[exit-code ${result.exitCode}]`)
    }

    if (result.signal) {
      lines.push(`[signal ${result.signal}]`)
    }
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
