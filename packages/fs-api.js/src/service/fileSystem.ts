import fs from "node:fs/promises"
import Path from "node:path"

export async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    if (isNotFoundError(error)) return false
    throw error
  }
}

export async function isFile(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return stat.isFile()
  } catch (error) {
    if (isNotFoundError(error)) return false
    throw error
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path)
    return stat.isDirectory()
  } catch (error) {
    if (isNotFoundError(error)) return false
    throw error
  }
}

export async function read(path: string): Promise<string> {
  return await fs.readFile(path, "utf8")
}

export async function write(path: string, text: string): Promise<void> {
  await fs.writeFile(path, text, "utf8")
}

export type FileSystemEntry = {
  name: string
  path: string
  kind: "File" | "Directory"
}

export type FileTypeKind =
  "Text" | "Image" | "Pdf" | "Archive" | "Binary" | "Unknown"

export type InspectFileResult = {
  kind: FileTypeKind
  mimeType: string | undefined
  size: number
}

export async function list(path: string): Promise<Array<string>> {
  const names = await fs.readdir(path)
  return names.sort().map((name) => Path.join(path, name))
}

export async function listEntries(
  path: string,
): Promise<Array<FileSystemEntry>> {
  const entries = await fs.readdir(path, { withFileTypes: true })

  return entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => ({
      name: entry.name,
      path: Path.join(path, entry.name),
      kind: entry.isDirectory() ? "Directory" : "File",
    }))
}

export async function inspectFile(path: string): Promise<InspectFileResult> {
  const stat = await fs.stat(path)

  if (!stat.isFile()) {
    throw new Error(`[fs-api] not a file: ${path}`)
  }

  const sample = await readSample(path, 4096)
  const detected = detectFileType(sample)

  return {
    ...detected,
    size: stat.size,
  }
}

async function readSample(path: string, size: number): Promise<Buffer> {
  const handle = await fs.open(path, "r")

  try {
    const buffer = Buffer.alloc(size)
    const { bytesRead } = await handle.read(buffer, 0, size, 0)

    return buffer.subarray(0, bytesRead)
  } finally {
    await handle.close()
  }
}

function detectFileType(
  sample: Buffer,
): Pick<InspectFileResult, "kind" | "mimeType"> {
  if (sample.length === 0) {
    return { kind: "Text", mimeType: "text/plain" }
  }

  if (startsWith(sample, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { kind: "Image", mimeType: "image/png" }
  }

  if (startsWith(sample, [0xff, 0xd8, 0xff])) {
    return { kind: "Image", mimeType: "image/jpeg" }
  }

  if (startsWith(sample, [0x47, 0x49, 0x46, 0x38])) {
    return { kind: "Image", mimeType: "image/gif" }
  }

  if (
    startsWith(sample, [0x52, 0x49, 0x46, 0x46]) &&
    sample.length >= 12 &&
    startsWith(sample.subarray(8), [0x57, 0x45, 0x42, 0x50])
  ) {
    return { kind: "Image", mimeType: "image/webp" }
  }

  if (startsWith(sample, [0x25, 0x50, 0x44, 0x46])) {
    return { kind: "Pdf", mimeType: "application/pdf" }
  }

  if (startsWith(sample, [0x50, 0x4b, 0x03, 0x04])) {
    return { kind: "Archive", mimeType: "application/zip" }
  }

  if (startsWith(sample, [0x1f, 0x8b])) {
    return { kind: "Archive", mimeType: "application/gzip" }
  }

  if (isTextSample(sample)) {
    return {
      kind: "Text",
      mimeType: startsWith(sample, [0x23, 0x21])
        ? "text/x-shellscript"
        : "text/plain",
    }
  }

  return { kind: "Binary", mimeType: "application/octet-stream" }
}

function isTextSample(sample: Buffer): boolean {
  let controlCount = 0

  for (const byte of sample) {
    if (byte === 0x00) return false

    if (byte < 0x20 && byte !== 0x09 && byte !== 0x0a && byte !== 0x0d) {
      controlCount += 1
    }
  }

  if (controlCount / sample.length > 0.3) return false

  try {
    new TextDecoder("utf-8", { fatal: true }).decode(sample)
    return true
  } catch {
    return false
  }
}

function startsWith(sample: Buffer, prefix: Array<number>): boolean {
  if (sample.length < prefix.length) return false

  return prefix.every((byte, index) => sample[index] === byte)
}

export async function listRecursive(path: string): Promise<Array<string>> {
  const output: Array<string> = []
  await visit(path)
  return output

  async function visit(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name))

    for (const entry of entries) {
      const childPath = Path.join(currentPath, entry.name)
      output.push(childPath)
      if (entry.isDirectory()) {
        await visit(childPath)
      }
    }
  }
}

export async function ensureFile(path: string): Promise<void> {
  await fs.mkdir(Path.dirname(path), { recursive: true })
  const file = await fs.open(path, "a")
  await file.close()
}

export async function ensureDirectory(path: string): Promise<void> {
  await fs.mkdir(path, { recursive: true })
}

export async function deleteFile(path: string): Promise<void> {
  await fs.unlink(path)
}

export async function deleteDirectory(path: string): Promise<void> {
  await fs.rmdir(path)
}

export async function remove(path: string): Promise<void> {
  await fs.rm(path, { recursive: true })
}

export { remove as delete }

export async function rename(path: string, newPath: string): Promise<void> {
  await fs.rename(path, newPath)
}

export function isNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const code = (error as NodeJS.ErrnoException).code
  return code === "ENOENT" || code === "ENOTDIR"
}
