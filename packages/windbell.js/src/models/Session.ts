import type { Sign } from "@xieyuheng/semiosis.js"
import type { WorkspaceId } from "./Workspace"

export type SessionId = string

export type Session = {
  id: SessionId
  workspaceId: WorkspaceId
  title: string
  signs: Array<Sign>
  createdAt: number
  updatedAt: number
}
