import { reactive, watch } from "vue"

export type Font = "unifont" | "system"

function getInitialFont(): Font {
  const stored = localStorage.getItem("windbell.font")
  if (stored === "unifont" || stored === "system") {
    return stored
  }
  return "unifont"
}

function applyFont(font: Font): void {
  document.documentElement.dataset.font = font
}

const state = reactive({
  name: getInitialFont(),
  setFont(name: Font) {
    this.name = name
  },
})

watch(
  () => state.name,
  (name) => {
    localStorage.setItem("windbell.font", name)
    applyFont(name)
  },
  { immediate: true },
)

export function useFont() {
  return state
}
