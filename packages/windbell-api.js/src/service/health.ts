export type WindbellHealth = {
  ok: boolean
  service: string
}

export async function health(): Promise<WindbellHealth> {
  return {
    ok: true,
    service: "windbell-api",
  }
}
