import { snapshot } from "@xieyuheng/std.js/snapshot"
import assert from "node:assert"
import Path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"
import { agentRun } from "../agent/index.ts"
import { makeAgent } from "../agent/index.ts"
import { formatSign } from "../format/index.ts"
import type { ModelOutput } from "../model/index.ts"
import { makeMockModel } from "../models/index.ts"
import { AssistantSign, UserSign, type Sign } from "../sign/index.ts"
import { makeBashTool } from "../tools/index.ts"

const currentDir = Path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = Path.join(currentDir, "fixtures", "workspace")
const snapshotDir = Path.join(currentDir, "..", "..", "snapshot")

type SnapshotCase = {
  name: string
  system: string
  prompts: Array<string>
  outputs: Array<ModelOutput>
  maxSteps?: number
  maxOutputChars?: number
  repeatLast?: boolean
}

const cases: Array<SnapshotCase> = [
  {
    name: "conversation",
    system:
      "You are a helpful software engineer assistant. The workspace is a small semiosis example.",
    prompts: ["请阅读 README.md。", "再看一下 src/main.ts。"],
    outputs: [
      {
        sign: AssistantSign("用户想了解项目说明。", "我先读取 README.md。", [
          {
            id: "call-readme",
            name: "bash",
            arguments: '{"command":"sed -n 1,20p README.md"}',
          },
        ]),
      },
      {
        sign: AssistantSign(
          "README.md 说明这是一个最小的 semiosis 示例。",
          "README.md 说明这是一个最小 semiosis 示例。",
          [],
        ),
      },
      {
        sign: AssistantSign("用户还想看入口文件。", "我再读取 src/main.ts。", [
          {
            id: "call-main",
            name: "bash",
            arguments: '{"command":"sed -n 1,20p src/main.ts"}',
          },
        ]),
      },
      {
        sign: AssistantSign(
          "入口文件里有一个最小的 main 函数。",
          "src/main.ts 中只有一个最小的 main 函数。",
          [],
        ),
      },
    ],
  },
  {
    name: "tool-errors",
    system: "You are a helpful software engineer assistant.",
    prompts: ["测试工具错误。"],
    outputs: [
      {
        sign: AssistantSign("先故意制造两个工具错误。", "", [
          {
            id: "call-missing",
            name: "missing",
            arguments: "{}",
          },
          {
            id: "call-fail",
            name: "bash",
            arguments: '{"command":"printf out; printf err >&2; exit 3"}',
          },
        ]),
      },
      {
        sign: AssistantSign(
          "已经收到两个工具错误。",
          "missing 工具不存在，bash 命令以非零状态结束。",
          [],
        ),
      },
    ],
  },
  {
    name: "max-steps",
    system: "You are a helpful software engineer assistant.",
    prompts: ["进入工具循环。"],
    repeatLast: true,
    maxSteps: 2,
    outputs: [
      {
        sign: AssistantSign("继续调用 bash。", "我再执行一次。", [
          {
            id: "call-loop",
            name: "bash",
            arguments: '{"command":"printf loop"}',
          },
        ]),
      },
    ],
  },
  {
    name: "truncate-output",
    system: "You are a helpful software engineer assistant.",
    prompts: ["测试输出截断。"],
    maxOutputChars: 4,
    outputs: [
      {
        sign: AssistantSign("测试输出截断。", "先打印一长串数字。", [
          {
            id: "call-truncate",
            name: "bash",
            arguments: '{"command":"printf 1234567890"}',
          },
        ]),
      },
      {
        sign: AssistantSign("输出已经被截断。", "已完成截断测试。", []),
      },
    ],
  },
]

for (const testCase of cases) {
  test(testCase.name, async () => {
    const model = makeMockModel(testCase.outputs, {
      repeatLast: testCase.repeatLast,
    })

    const agent = makeAgent(model, {
      system: testCase.system,
      cwd: fixtureDir,
      tools: [
        makeBashTool({
          description: "test bash",
          timeoutMs: 5000,
          maxOutputChars: testCase.maxOutputChars ?? 2000,
        }),
      ],
      maxSteps: testCase.maxSteps ?? 8,
    })

    const signs: Array<Sign> = [...agent.context.signs]

    for (const prompt of testCase.prompts) {
      signs.push(UserSign(prompt))

      for await (const sign of agentRun(agent, prompt)) {
        signs.push(sign)
      }
    }

    const text = signs
      .map(formatSign)
      .filter((output) => output !== "")
      .map((output) => `${output}\n`)
      .join("")
    snapshot(snapshotDir, `${testCase.name}.out`, text)

    assert.equal(model.inputs.length > 0, true)
  })
}
