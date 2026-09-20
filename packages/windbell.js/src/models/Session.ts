import type { Sign } from "@xieyuheng/semiosis.js"
import type { ProjectId } from "./Project"

export type SessionId = string

export type Session = {
  id: SessionId
  projectId: ProjectId
  title: string
  signs: Array<Sign>
  createdAt: number
  updatedAt: number
}
