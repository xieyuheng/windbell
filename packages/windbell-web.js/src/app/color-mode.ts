import { reactive, watch } from "vue"

export type ColorMode = "light" | "dark"
export type ColorModePreference = "system" | ColorMode

export type ColorModeState = {
  preference: ColorModePreference
  resolved: ColorMode
  setPreference(preference: ColorModePreference): void
}

const COLOR_MODE_STORAGE_KEY = "windbell.color-mode"

function isColorModePreference(
  value: string | null,
): value is ColorModePreference {
  return value === "system" || value === "light" || value === "dark"
}

function getInitialPreference(): ColorModePreference {
  const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY)
  return isColorModePreference(stored) ? stored : "system"
}

function resolveColorMode(preference: ColorModePreference): ColorMode {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }

  return preference
}

function applyColorMode(colorMode: ColorModeState): void {
  document.documentElement.classList.toggle(
    "dark",
    colorMode.resolved === "dark",
  )
  document.documentElement.style.colorScheme = colorMode.resolved
}

export function makeColorMode(): ColorModeState {
  const colorMode = reactive<ColorModeState>({
    preference: getInitialPreference(),
    resolved: "light",
    setPreference(preference) {
      this.preference = preference
    },
  })

  colorMode.resolved = resolveColorMode(colorMode.preference)
  return colorMode
}

const colorMode = makeColorMode()

watch(
  () => colorMode.preference,
  (preference) => {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, preference)
    colorMode.resolved = resolveColorMode(preference)
    applyColorMode(colorMode)
  },
  { immediate: true },
)

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (colorMode.preference === "system") {
      colorMode.resolved = resolveColorMode("system")
      applyColorMode(colorMode)
    }
  })

export function useColorMode(): ColorModeState {
  return colorMode
}
