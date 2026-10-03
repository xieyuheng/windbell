import type { HeaderFactory } from "../../../http/index.ts"

export const deepseekHeaders: HeaderFactory = ({ config }) =>
  new Headers({
    Authorization: `Bearer ${config.key}`,
  })
