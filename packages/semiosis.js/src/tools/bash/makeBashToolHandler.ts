import { spawn } from "node:child_process"
import process from "node:process"
import type { ToolHandler } from "../../tool/index.ts"
import {
  killChildProcessTree,
  useDetachedChildProcess,
} from "../killChildProcessTree.ts"

type BashRunOptions = {
  cwd: string
  timeoutMs: number
  maxOutputChars: number
  signal?: AbortSignal
}

type BashRunResult = {
  exitCode: number | null
  signal: NodeJS.Signals | null
  stdout: string
  stderr: string
  stdoutTruncated: boolean
  stderrTruncated: boolean
  timedOut: boolean
  cancelled: boolean
}

export type BashToolHandlerOptions = {
  cwd: string
  timeoutMs: number
  maxOutputChars: number
}

export function makeBashToolHandler(
  options: BashToolHandlerOptions,
): ToolHandler {
  return async (args, handlerOptions) => {
    const command = args.command as string

    const result = await bashRun(command, {
      cwd: options.cwd,
      timeoutMs: options.timeoutMs,
      maxOutputChars: options.maxOutputChars,
      signal: handlerOptions.signal,
    })

    return formatBashRunResult(result, options.timeoutMs)
  }
}

function bashRun(
  command: string,
  options: BashRunOptions,
): Promise<BashRunResult> {
  if (options.signal?.aborted) {
    return Promise.resolve(cancelledBashRunResult())
  }

  return new Promise((resolve, reject) => {
    const child = spawn("bash", ["-c", command], {
      cwd: options.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
      // POSIX process group: let cancellation kill the shell and descendants.
      detached: useDetachedChildProcess,
    })

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

    child.stdout.on("data", (chunk: Buffer) => {
      if (stdoutTruncated) return
      const text = chunk.toString("utf8")
      const remaining = options.maxOutputChars - stdout.length
      if (text.length > remaining) {
        stdout += text.slice(0, Math.max(remaining, 0))
        stdoutTruncated = true
      } else {
        stdout += text
      }
    })

    child.stderr.on("data", (chunk: Buffer) => {
      if (stderrTruncated) return
      const text = chunk.toString("utf8")
      const remaining = options.maxOutputChars - stderr.length
      if (text.length > remaining) {
        stderr += text.slice(0, Math.max(remaining, 0))
        stderrTruncated = true
      } else {
        stderr += text
      }
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

function cancelledBashRunResult(): BashRunResult {
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

function formatBashRunResult(result: BashRunResult, timeoutMs: number): string {
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
