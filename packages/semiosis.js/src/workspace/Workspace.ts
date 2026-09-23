export type WorkspaceId = string

export type Workspace = {
  id: WorkspaceId
  name: string
  root: string
  createdAt: number
  updatedAt: number
}
