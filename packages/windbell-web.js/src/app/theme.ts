import { reactive, watch } from "vue"

export type ThemeMode = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export type Theme = {
  mode: ThemeMode
  resolved: ResolvedTheme
  setMode(mode: ThemeMode): void
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem("windbell.theme")
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored
  }
  return "system"
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return mode
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme.resolved === "dark")
  document.documentElement.style.colorScheme = theme.resolved
}

export function makeTheme(): Theme {
  const theme = reactive<Theme>({
    mode: getInitialMode(),
    resolved: "light",
    setMode(mode) {
      this.mode = mode
    },
  })

  theme.resolved = resolveTheme(theme.mode)
  return theme
}

const theme = makeTheme()

watch(
  () => theme.mode,
  (mode) => {
    localStorage.setItem("windbell.theme", mode)
    theme.resolved = resolveTheme(mode)
    applyTheme(theme)
  },
  { immediate: true },
)

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (theme.mode === "system") {
      theme.resolved = resolveTheme("system")
      applyTheme(theme)
    }
  })

export function useTheme(): Theme {
  return theme
}
