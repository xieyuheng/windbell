<script setup lang="ts">
import type { Yaml } from "mdast"
import { computed } from "vue"
import * as YAML from "yaml"
import type { MarkdownState } from "../markdownState"

interface FrontmatterData {
  title: string | undefined
  authors: string[]
  date: string | undefined
  tags: string[]
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
  const date = readDate(record.date ?? record.year)
  const tags = readStringArray(record.tags ?? record.keywords)

  if (
    title === undefined &&
    authors.length === 0 &&
    date === undefined &&
    tags.length === 0
  ) {
    return undefined
  }

  return { title, authors, date, tags }
})
</script>

<template>
  <header
    v-if="frontmatter !== undefined"
    class="flex flex-col gap-2"
  >
    <div v-if="frontmatter.title" class="text-2xl font-semibold text-ink">
      {{ frontmatter.title }}
    </div>

    <div
      v-if="frontmatter.authors.length > 0 || frontmatter.date"
      class="text-ink-muted"
    >
      <span v-if="frontmatter.authors.length > 0">
        {{ frontmatter.authors.join(", ") }}
      </span>
      <span v-if="frontmatter.authors.length > 0 && frontmatter.date"> · </span>
      <span v-if="frontmatter.date">{{ frontmatter.date }}</span>
    </div>

    <div v-if="frontmatter.tags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in frontmatter.tags"
        :key="tag"
        class="rounded border border-line px-2 py-0.5 text-ink-muted"
      >
        {{ tag }}
      </span>
    </div>
  </header>

  <pre v-else class="my-4 whitespace-pre-wrap font-mono text-ink-muted">{{
    node.value
  }}</pre>
</template>
