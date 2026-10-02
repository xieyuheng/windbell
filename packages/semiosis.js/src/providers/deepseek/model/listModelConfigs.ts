import type { Database } from "../../../database/index.ts"
import { readModelConfigs } from "./readModelConfigs.ts"

export async function listModelConfigs(
  database: Database,
): Promise<Array<string>> {
  const configs = await readModelConfigs(database)
  return Object.keys(configs).sort()
}
