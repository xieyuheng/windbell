import { reactive, watch } from "vue"
import { findPattern, nonePattern, patterns } from "./patterns"

const storageKey = "windbell.wallpaper"

function fallbackPatternId(): string {
  return patterns[0]?.id ?? nonePattern.id
}

function getInitialPatternId(): string {
  try {
    const stored = localStorage.getItem(storageKey)

    if (stored !== null && findPattern(stored) !== undefined) {
      return stored
    }
  } catch {
    // ignore storage errors
  }

  return fallbackPatternId()
}

export type WallpaperState = {
  patternId: string
  setPattern(id: string): void
}

export const wallpaper = reactive<WallpaperState>({
  patternId: getInitialPatternId(),
  setPattern(id) {
    if (findPattern(id) === undefined) return

    this.patternId = id
  },
})

function applyWallpaper(): void {
  const root = document.documentElement
  const pattern = findPattern(wallpaper.patternId)

  if (pattern === undefined || pattern.url === "") {
    root.style.removeProperty("--wallpaper-image")
    root.style.removeProperty("--wallpaper-tile")
    root.style.removeProperty("--wallpaper-opacity-light")
    root.style.removeProperty("--wallpaper-opacity-dark")
    return
  }

  root.style.setProperty("--wallpaper-image", `url("${pattern.url}")`)
  root.style.setProperty("--wallpaper-tile", `${pattern.tile}px`)
  root.style.setProperty(
    "--wallpaper-opacity-light",
    String(pattern.opacity.light),
  )
  root.style.setProperty(
    "--wallpaper-opacity-dark",
    String(pattern.opacity.dark),
  )
}

watch(
  () => wallpaper.patternId,
  (id) => {
    try {
      localStorage.setItem(storageKey, id)
    } catch {
      // ignore storage errors
    }

    applyWallpaper()
  },
  { immediate: true },
)

export function useWallpaper(): WallpaperState {
  return wallpaper
}
