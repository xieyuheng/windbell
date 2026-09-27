export type PatternId = string

export type PatternOpacity = {
  light: number
  dark: number
}

export type PatternMeta = {
  label?: Record<string, string>
  tile?: number
  opacity?: Partial<PatternOpacity>
  order?: number
}

export type PatternDefinition = {
  id: PatternId
  label: Record<string, string>
  url: string
  tile: number
  opacity: PatternOpacity
  order: number
}
