#!/usr/bin/env -S node

import process from "node:process"
import { makeCli } from "./cli/makeCli.ts"

await makeCli().run(process.argv.slice(2))
