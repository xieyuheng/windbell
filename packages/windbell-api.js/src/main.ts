#!/usr/bin/env -S node

import { defaultDatabaseRoot, makeDatabase } from "@xieyuheng/semiosis.js"
import process from "node:process"
import { startWindbellServer } from "./server/index.ts"

const database = makeDatabase({
  root: defaultDatabaseRoot(),
})

const hostname = "127.0.0.1"
const port = Number(process.env.PORT ?? "3000")
const corsOrigin = process.env.CORS_ORIGIN

await startWindbellServer({
  database,
  hostname,
  port,
  corsOrigin,
})
