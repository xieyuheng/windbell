import fs from "node:fs"
import Path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "zod"
import type { ModelOutput } from "../model/index.ts"
import type { Sign } from "../sign/index.ts"
import { makeMockModel, type MockModel } from "./makeMockModel.ts"

const toolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  arguments: z.string(),
})

const signSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("SystemSign"),
    content: z.string(),
  }),
  z.object({
    kind: z.literal("UserSign"),
    content: z.string(),
  }),
  z.object({
    kind: z.literal("AssistantSign"),
    reasoning: z.string(),
    content: z.string(),
    toolCalls: z.array(toolCallSchema),
  }),
  z.object({
    kind: z.literal("ToolSign"),
    toolCallId: z.string(),
    content: z.string(),
  }),
  z.object({
    kind: z.literal("ErrorSign"),
    message: z.string(),
  }),
])

export function readMockModel(name: string): MockModel {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error(`[readMockModel] invalid model name: ${name}`)
  }

  const path = mockModelPath(name)
  const text = readMockModelFile(path)
  const outputs: Array<ModelOutput> = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line, index) => ({
      sign: parseMockSign(path, line, index + 1),
    }))

  return makeMockModel(outputs)
}

function mockModelPath(name: string): string {
  const currentDir = Path.dirname(fileURLToPath(import.meta.url))
  return Path.join(currentDir, "..", "..", "mock", "models", `${name}.jsonl`)
}

function readMockModelFile(path: string): string {
  try {
    return fs.readFileSync(path, "utf8")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `[readMockModel] fail to read model file: ${path}\n  ${message}`,
    )
  }
}

function parseMockSign(path: string, text: string, lineNumber: number): Sign {
  const value = parseMockSignJson(path, text, lineNumber)
  const result = signSchema.safeParse(value)

  if (!result.success) {
    throw new Error(
      `[readMockModel] invalid sign: ${path}:${lineNumber}\n  ${result.error.message}`,
    )
  }

  return result.data
}

function parseMockSignJson(
  path: string,
  text: string,
  lineNumber: number,
): unknown {
  try {
    return JSON.parse(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `[readMockModel] invalid JSON: ${path}:${lineNumber}\n  ${message}`,
    )
  }
}
