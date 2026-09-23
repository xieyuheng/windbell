export type FileSystemHealth = {
  ok: boolean
  service: string
}

export async function health(): Promise<FileSystemHealth> {
  return {
    ok: true,
    service: "fs-api",
  }
}
