import type { Database } from "../../../database/index.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function isModelEnabled(
  database: Database,
  name: string,
): Promise<boolean> {
  const configs = await readModelConfigs(database)
  return Object.hasOwn(configs, name)
}
