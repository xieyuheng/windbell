import {
  makeFileSystemClient,
  type FileSystemEntry,
} from "@xieyuheng/fs-api.js/client"
import type { Component } from "vue"
import DirectoryView from "./DirectoryView.vue"
import TextView from "./TextView.vue"
import UnknownView from "./UnknownView.vue"

const fileSystem = makeFileSystemClient({
  baseUrl: "/api/fs",
})

const textExtensions = new Set([
  "bash",
  "c",
  "cc",
  "conf",
  "cpp",
  "cs",
  "css",
  "csv",
  "cts",
  "cjs",
  "fish",
  "go",
  "graphql",
  "gql",
  "h",
  "hpp",
  "htm",
  "html",
  "ini",
  "java",
  "js",
  "json",
  "jsonc",
  "jsx",
  "kt",
  "less",
  "log",
  "markdown",
  "md",
  "mjs",
  "mts",
  "php",
  "py",
  "rb",
  "rs",
  "scss",
  "sh",
  "sql",
  "text",
  "toml",
  "ts",
  "tsv",
  "tsx",
  "txt",
  "vue",
  "xml",
  "yaml",
  "yml",
  "zsh",
])

function extensionOf(name: string): string {
  const index = name.lastIndexOf(".")
  if (index <= 0) return ""

  return name.slice(index + 1).toLowerCase()
}

function resolveKnownEntryView(entry: FileSystemEntry): Component | undefined {
  if (entry.kind === "Directory") return DirectoryView
  if (textExtensions.has(extensionOf(entry.name))) return TextView

  return undefined
}

export async function resolveEntryView(
  entry: FileSystemEntry,
): Promise<Component> {
  const knownView = resolveKnownEntryView(entry)
  if (knownView !== undefined) return knownView

  try {
    const info = await fileSystem.inspectFile(entry.path)

    switch (info.kind) {
      case "Text":
        return TextView
      case "Image":
      case "Pdf":
      case "Archive":
      case "Binary":
      case "Unknown":
        return UnknownView
    }
  } catch {
    return UnknownView
  }
}
