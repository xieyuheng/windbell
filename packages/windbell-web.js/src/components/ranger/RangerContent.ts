import type { FileSystemEntry } from "@windbell/fs-api.js/client"

export type RangerDirectoryContent = {
  type: "directory"
  entries: FileSystemEntry[]
}

export type RangerFileContent = {
  type: "file"
  bytes: Uint8Array
}

export type RangerEmptyContent = {
  type: "none"
}

export type RangerContent =
  RangerDirectoryContent | RangerFileContent | RangerEmptyContent
