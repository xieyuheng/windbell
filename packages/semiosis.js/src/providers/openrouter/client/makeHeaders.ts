import type { HeaderFactory } from "../../../http/index.ts"

export const openrouterHeaders: HeaderFactory = ({ config }) =>
  new Headers({
    Authorization: `Bearer ${config.key}`,
    "HTTP-Referer": "https://windbell.xieyuheng.com",
    "X-Title": "windbell",
  })
