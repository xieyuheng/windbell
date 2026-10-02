import type { Database } from "../../../database/index.ts"
import { makeClient } from "../client/makeClient.ts"
import { readClientConfig } from "../client/readClientConfig.ts"

export async function listAvailableModels(
  database: Database,
): Promise<Array<string>> {
  const client = makeClient(await readClientConfig(database))
  const models = await client.listModels()

  return models.map((model) => model.id)
}
