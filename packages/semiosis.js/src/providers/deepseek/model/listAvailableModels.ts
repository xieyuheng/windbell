import type { Database } from "../../../database/index.ts"
import { makeClient } from "../client/Client.ts"
import { readClientConfig } from "../client/readClientConfig.ts"

export async function listAvailableModels(
  database: Database,
): Promise<Array<string>> {
  const client = makeClient(await readClientConfig(database))
  const output = await client.models.list()

  return output.data.map((model) => model.id)
}
