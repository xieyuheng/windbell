import type { DustbinSessionsClient } from "./DustbinSessionsClient.ts"
import { makeDustbinSessionsClient } from "./DustbinSessionsClient.ts"
import type { DustbinWorkspacesClient } from "./DustbinWorkspacesClient.ts"
import { makeDustbinWorkspacesClient } from "./DustbinWorkspacesClient.ts"
import type { HealthClient } from "./HealthClient.ts"
import { makeHealthClient } from "./HealthClient.ts"
import type { ProvidersClient } from "./ProvidersClient.ts"
import { makeProvidersClient } from "./ProvidersClient.ts"
import type { SemiosisClientConfig } from "./SemiosisClientConfig.ts"
import type { SessionsClient } from "./SessionsClient.ts"
import { makeSessionsClient } from "./SessionsClient.ts"
import type { SettingsClient } from "./SettingsClient.ts"
import { makeSettingsClient } from "./SettingsClient.ts"
import type { WorkspacesClient } from "./WorkspacesClient.ts"
import { makeWorkspacesClient } from "./WorkspacesClient.ts"

export type SemiosisClient = {
  health: HealthClient
  providers: ProvidersClient
  settings: SettingsClient
  workspaces: WorkspacesClient
  sessions: SessionsClient
  dustbin: {
    sessions: DustbinSessionsClient
    workspaces: DustbinWorkspacesClient
  }
}

export function makeSemiosisClient(
  config: SemiosisClientConfig,
): SemiosisClient {
  return {
    health: makeHealthClient(config),
    providers: makeProvidersClient(config),
    settings: makeSettingsClient(config),
    workspaces: makeWorkspacesClient(config),
    sessions: makeSessionsClient(config),
    dustbin: {
      sessions: makeDustbinSessionsClient(config),
      workspaces: makeDustbinWorkspacesClient(config),
    },
  }
}
