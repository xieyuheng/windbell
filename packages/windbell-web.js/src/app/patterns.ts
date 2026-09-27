import type { PatternDefinition, PatternId, PatternMeta } from "./patternTypes"

const defaultTile = 96

const defaultOpacity = {
  light: 0.08,
  dark: 0.14,
}

const svgModules = import.meta.glob("./patterns/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>

const metaModules = import.meta.glob("./patterns/*.pattern.ts", {
  eager: true,
}) as Record<string, { default: PatternMeta }>

function basename(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1)
  return name.replace(/\.[^.]+$/, "")
}

export const nonePattern: PatternDefinition = {
  id: "none",
  label: {
    "zh-CN": "无",
    "en-US": "None",
  },
  url: "",
  tile: 0,
  opacity: { light: 0, dark: 0 },
  order: 0,
}

export const patterns: Array<PatternDefinition> = Object.entries(svgModules)
  .map(([path, url]) => {
    const id = basename(path)
    const meta = metaModules[`./patterns/${id}.pattern.ts`]?.default ?? {}

    return {
      id,
      label: {
        "zh-CN": id,
        "en-US": id,
        ...meta.label,
      },
      url,
      tile: meta.tile ?? defaultTile,
      opacity: {
        ...defaultOpacity,
        ...meta.opacity,
      },
      order: meta.order ?? 100,
    }
  })
  .sort(
    (left, right) =>
      left.order - right.order || left.id.localeCompare(right.id),
  )

export const patternOptions: Array<PatternDefinition> = [
  nonePattern,
  ...patterns,
]

export function findPattern(id: PatternId): PatternDefinition | undefined {
  return patternOptions.find((pattern) => pattern.id === id)
}
