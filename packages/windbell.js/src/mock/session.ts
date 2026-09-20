import type { Sign } from "@xieyuheng/semiosis.js"
import type { Session } from "../models/Session"

const windbellSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "请解释风铃和符号过程的关系。",
  },
  {
    kind: "AssistantSign",
    reasoning: "风铃不是一个对象，而是一个把风转译为声音的符号过程。",
    content:
      "风本身不可见，它必须经过风铃才能被听见。思想也必须经过符号，才能成为可解释的对象。",
    toolCalls: [],
  },
]

const metaLispSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "帮我设计一个最小的表达式求值器。",
  },
  {
    kind: "AssistantSign",
    reasoning: "先定义语法，再实现 eval。",
    content: "可以先从字面量、变量和函数调用三种表达式开始。",
    toolCalls: [
      {
        id: "call-1",
        name: "bash",
        arguments: '{"command":"sed -n 1,80p src/eval.ts"}',
      },
    ],
  },
  {
    kind: "ToolSign",
    toolCallId: "call-1",
    content: "已通过 bash 读取 src/eval.ts 的前 80 行。",
  },
]

export const mockSessions: Array<Session> = [
  {
    id: "session-windbell",
    projectId: "project-windbell",
    title: "风铃与符号过程",
    signs: windbellSigns,
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
  {
    id: "session-meta-lisp",
    projectId: "project-meta-lisp",
    title: "最小求值器",
    signs: metaLispSigns,
    createdAt: 1710000000000,
    updatedAt: 1710000000000,
  },
]
