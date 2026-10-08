import assert from "node:assert/strict"
import fs from "node:fs/promises"
import Os from "node:os"
import Path from "node:path"
import { test } from "node:test"
import { makeDatabase } from "../database/index.ts"
import type { Model } from "../model/index.ts"
import {
  ToolCallSign,
  ToolOutputSign,
  ToolSign,
  UserSign,
  isToolOutputSign,
  type Sign,
} from "../sign/index.ts"
import { makeToolRouter, type ToolRouter } from "../tool/index.ts"
import { makeAgentFromSession } from "../session/index.ts"
import { makeAgent, type Agent } from "./Agent.ts"
import { agentInterpret } from "./agentInterpret.ts"
import { repairOrphanToolCalls } from "./repairOrphanToolCalls.ts"

const emptyObjectSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
}

const unusedModel: Model = {
  providerName: "test",
  name: "test",
  interpret: async () => [],
}

function makeTestAgent(
  context: Array<Sign>,
  model: Model = unusedModel,
  toolRouter: ToolRouter = makeToolRouter(),
): Agent {
  return makeAgent({
    model,
    toolRouter,
    getContext: async () => context,
    appendContext: async (signs) => {
      context.push(...signs)
    },
  })
}

test("repairOrphanToolCalls appends one output per orphan call", async () => {
  const context: Array<Sign> = [
    ToolCallSign({
      callId: "call-1",
      name: "bash",
      arguments: '{"command":"pwd"}',
    }),
    ToolCallSign({
      callId: "call-2",
      name: "bash",
      arguments: '{"command":"ls"}',
    }),
  ]
  const agent = makeTestAgent(context)

  const repairs = await repairOrphanToolCalls(agent)

  assert.deepEqual(
    repairs.map((repair) => repair.callId),
    ["call-1", "call-2"],
  )
  assert.equal(context.filter(isToolOutputSign).length, 2)
  assert.match(repairs[0]?.content ?? "", /interrupted/)
  assert.match(repairs[0]?.content ?? "", /partially executed/)

  const secondRepairs = await repairOrphanToolCalls(agent)
  assert.deepEqual(secondRepairs, [])
  assert.equal(context.filter(isToolOutputSign).length, 2)
})

test("repairOrphanToolCalls leaves complete tool calls alone", async () => {
  const context: Array<Sign> = [
    ToolCallSign({
      callId: "call-1",
      name: "bash",
      arguments: "{}",
    }),
    ToolOutputSign("call-1", "ok"),
  ]
  const agent = makeTestAgent(context)

  const repairs = await repairOrphanToolCalls(agent)

  assert.deepEqual(repairs, [])
  assert.equal(context.filter(isToolOutputSign).length, 1)
})

test("agentInterpret repairs orphan tool calls before appending input", async () => {
  const context: Array<Sign> = [
    ToolCallSign({
      callId: "call-orphan",
      name: "bash",
      arguments: '{"command":"pwd"}',
    }),
  ]
  let interpretedContext: Array<Sign> = []
  const model: Model = {
    providerName: "test",
    name: "test",
    interpret: async (input) => {
      interpretedContext = [...input]
      return []
    },
  }
  const agent = makeTestAgent(context, model)
  const yielded: Array<Sign> = []

  for await (const sign of agentInterpret(agent, [UserSign("next")])) {
    yielded.push(sign)
  }

  assert.deepEqual(
    yielded.map((sign) => sign.kind),
    ["ToolOutputSign", "UserSign"],
  )
  assert.deepEqual(
    context.map((sign) => sign.kind),
    ["ToolCallSign", "ToolOutputSign", "UserSign"],
  )
  assert.deepEqual(
    interpretedContext.map((sign) => sign.kind),
    ["ToolCallSign", "ToolOutputSign", "UserSign"],
  )
})

test("agentInterpret records a ToolOutputSign for every tool call", async () => {
  const toolRouter = makeToolRouter()
  toolRouter.defineTool(
    ToolSign("ok", "Succeeds.", emptyObjectSchema),
    () => "ok",
  )
  toolRouter.defineTool(ToolSign("fail", "Fails.", emptyObjectSchema), () => {
    throw new Error("tool exploded")
  })

  let turn = 0
  const model: Model = {
    providerName: "test",
    name: "test",
    interpret: async () => {
      turn += 1
      if (turn === 1) {
        return [
          ToolCallSign({ callId: "call-ok", name: "ok", arguments: "{}" }),
          ToolCallSign({
            callId: "call-fail",
            name: "fail",
            arguments: "{}",
          }),
        ]
      }
      return []
    },
  }
  const context: Array<Sign> = []
  const agent = makeTestAgent(context, model, toolRouter)

  for await (const _sign of agentInterpret(agent, [UserSign("run")])) {
    // drain
  }

  const outputs = context.filter(isToolOutputSign)
  assert.deepEqual(
    outputs.map((output) => output.callId),
    ["call-ok", "call-fail"],
  )
  assert.match(outputs[1]?.content ?? "", /tool exploded/)
})

test("agentInterpret repairs persisted orphan tool calls and yields input", async () => {
  const root = await fs.mkdtemp(Path.join(Os.tmpdir(), "semiosis-repair-"))

  try {
    const database = makeDatabase({ root })
    const workspace = await database.workspaces.make({
      name: "test",
      root: Path.join(root, "workspace"),
    })
    const session = await database.sessions.make({
      workspaceId: workspace.id,
      title: "test",
    })

    await database.sessions.appendSign(
      session.id,
      ToolCallSign({
        callId: "call-orphan",
        name: "bash",
        arguments: '{"command":"pwd"}',
      }),
    )

    let interpretedContext: Array<Sign> = []
    const model: Model = {
      providerName: "test",
      name: "test",
      interpret: async (input) => {
        interpretedContext = [...input]
        return []
      },
    }

    const agent = await makeAgentFromSession({
      database,
      sessionId: session.id,
      model,
      makeToolRouter: () => makeToolRouter(),
    })

    const before = await database.sessions.get(session.id)
    assert.deepEqual(
      before?.context.map((sign) => sign.kind),
      ["ToolCallSign"],
    )

    const yielded: Array<Sign> = []

    for await (const sign of agentInterpret(agent, [UserSign("next")])) {
      yielded.push(sign)
    }

    assert.deepEqual(
      yielded.map((sign) => sign.kind),
      ["ToolOutputSign", "UserSign"],
    )
    assert.deepEqual(
      interpretedContext.map((sign) => sign.kind),
      ["ToolCallSign", "ToolOutputSign", "UserSign"],
    )

    const loaded = await database.sessions.get(session.id)
    assert.deepEqual(
      loaded?.context.map((sign) => sign.kind),
      ["ToolCallSign", "ToolOutputSign", "UserSign"],
    )
  } finally {
    await fs.rm(root, { recursive: true, force: true })
  }
})
