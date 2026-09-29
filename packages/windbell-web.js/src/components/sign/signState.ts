export type SignState = {
  workspaceRoot?: string
}

export function createSignState(options: SignState = {}): SignState {
  return {
    workspaceRoot: options.workspaceRoot,
  }
}
