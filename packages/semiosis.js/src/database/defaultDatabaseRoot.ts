import Os from "node:os"
import Path from "node:path"
import process from "node:process"

export function defaultDatabaseRoot(): string {
  return (
    process.env.WINDBELL_DATABASE ??
    Path.join(Os.homedir(), ".windbell", "database")
  )
}
