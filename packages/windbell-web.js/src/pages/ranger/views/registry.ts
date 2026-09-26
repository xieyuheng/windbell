import type { FileSystemEntry } from "@xieyuheng/fs-api.js/client"
import type { Component } from "vue"
import DirectoryView from "./DirectoryView.vue"
import TextView from "./TextView.vue"
import UnknownView from "./UnknownView.vue"

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

export function resolveEntryView(entry: FileSystemEntry): Component {
  if (entry.kind === "Directory") return DirectoryView
  if (textExtensions.has(extensionOf(entry.name))) return TextView

  return UnknownView
}
