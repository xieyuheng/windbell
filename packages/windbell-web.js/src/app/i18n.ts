import { createI18n } from "vue-i18n"

export type Locale = "zh-CN" | "en-US"

export const supportedLocales: Array<{ value: Locale; label: string }> = [
  { value: "zh-CN", label: "中文" },
  { value: "en-US", label: "English" },
]

const messages = {
  "zh-CN": {
    app: {
      name: "风铃",
      back: "返回",
    },
  },
  "en-US": {
    app: {
      name: "Windbell",
      back: "Back",
    },
  },
}

function getInitialLocale(): Locale {
  const stored = localStorage.getItem("windbell.locale")
  if (stored === "zh-CN" || stored === "en-US") return stored
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "zh-CN",
  messages,
})

export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale
  localStorage.setItem("windbell.locale", locale)
  document.documentElement.lang = locale
}
