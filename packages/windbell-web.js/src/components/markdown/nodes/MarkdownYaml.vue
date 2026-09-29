<script setup lang="ts">
import type { Yaml } from "mdast"
import { computed } from "vue"
import * as YAML from "yaml"
import type { MarkdownState } from "../markdownState.ts"

interface FrontmatterData {
  title: string | undefined
  authors: string[]
  date: string | undefined
}

const props = defineProps<{
  node: Yaml
  state: MarkdownState
}>()

function readString(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)

  return undefined
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => readStringArray(item))
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "")
  }

  if (typeof value === "number") {
    return [String(value)]
  }

  return []
}

function readDate(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (value instanceof Date) return value.toISOString().slice(0, 10)

  return undefined
}

function readYear(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (typeof value === "number") return String(value)
  if (value instanceof Date) return String(value.getFullYear())

  return undefined
}

const frontmatter = computed<FrontmatterData | undefined>(() => {
  let value: unknown

  try {
    value = YAML.parse(props.node.value)
  } catch {
    return undefined
  }

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>
  const title = readString(record.title)
  const authors = readStringArray(record.authors ?? record.author)
  const date = readDate(record.date) ?? readYear(record.year)

  if (title === undefined && authors.length === 0 && date === undefined) {
    return undefined
  }

  return { title, authors, date }
})
</script>

<template>
  <header v-if="frontmatter !== undefined" class="flex flex-col gap-1">
    <div v-if="frontmatter.title" class="text-2xl font-semibold text-ink">
      {{ frontmatter.title }}
    </div>

    <div v-if="frontmatter.authors.length > 0">
      {{ frontmatter.authors.join(", ") }}
    </div>

    <div v-if="frontmatter.date">
      {{ frontmatter.date }}
    </div>
  </header>

  <pre v-else class="whitespace-pre-wrap font-mono">{{ node.value }}</pre>
</template>
