import type { Sign } from "@xieyuheng/semiosis.js"
import type { Session } from "../models/Session"

const windbellSemiosisSigns: Array<Sign> = [
  {
    kind: "SystemSign",
    content: "You are a helpful software engineer assistant.",
  },
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

const windbellMobileSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "移动端选择工作区和对话的界面，应该用卡片还是列表？",
  },
  {
    kind: "AssistantSign",
    reasoning: "工作区数量少，适合卡片；对话数量会增长，适合列表行。",
    content:
      "建议工作区用卡片，对话用列表行。移动端用堆栈导航：工作区 -> 对话列表 -> 对话页面。",
    toolCalls: [],
  },
]

const metaLispEvalSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "帮我设计一个最小的表达式求值器。",
  },
  {
    kind: "AssistantSign",
    reasoning: "先看当前实现，再从字面量、变量和函数调用三种表达式开始。",
    content: "我先读取 src/eval.ts，确认现有结构。",
    toolCalls: [
      {
        id: "call-read-eval",
        name: "bash",
        arguments: '{"command":"sed -n 1,120p src/eval.ts"}',
      },
    ],
  },
  {
    kind: "ToolSign",
    toolCallId: "call-read-eval",
    content:
      'export function evaluate(input: string): unknown {\n  throw new Error("not implemented")\n}',
  },
  {
    kind: "AssistantSign",
    reasoning: "当前实现只有入口函数，没有 AST 和求值环境。",
    content:
      "可以先把表达式解析成字面量、变量、调用三种节点，再实现一个最小的 env 来查变量。",
    toolCalls: [],
  },
]

const metaLispTypeSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "给这个求值器加一个最简单的类型检查。",
  },
  {
    kind: "AssistantSign",
    reasoning: "最小类型检查可以先只处理数字和布尔值。",
    content: "先运行一下现有测试，确认当前行为。",
    toolCalls: [
      {
        id: "call-run-test",
        name: "bash",
        arguments: '{"command":"npm test"}',
      },
    ],
  },
  {
    kind: "ToolSign",
    toolCallId: "call-run-test",
    content: "exit code: 1\nstderr: TypeError: evaluate is not a function",
  },
  {
    kind: "ErrorSign",
    message: "[agentRun] max steps reached: 8",
  },
]

const fsApiRpcSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "fs-api 应该用 REST 还是 RPC？",
  },
  {
    kind: "AssistantSign",
    reasoning:
      "文件系统操作更像 RPC，而且 path 可以放在 JSON body 中，避开 URL 编码问题。",
    content:
      "建议用 RPC 风格。每个方法一个 POST endpoint，参数放 JSON body，返回直接是结果。",
    toolCalls: [],
  },
  {
    kind: "UserSign",
    content: "先看一下当前的文件结构。",
  },
  {
    kind: "AssistantSign",
    reasoning: "用 bash 快速查看目录。",
    content: "我列出 package 下的目录结构。",
    toolCalls: [
      {
        id: "call-list",
        name: "bash",
        arguments: '{"command":"find src -maxdepth 2 -type f | sort"}',
      },
    ],
  },
  {
    kind: "ToolSign",
    toolCallId: "call-list",
    content:
      "src/client/FileSystemClient.ts\nsrc/index.ts\nsrc/server/createFileSystemServer.ts\nsrc/server/handleFileSystemRequest.ts",
  },
]

const fsApiClientSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "帮我为 fs-api 生成一个类型化的 client 封装。",
  },
  {
    kind: "AssistantSign",
    reasoning: "先定义 client 类型，再实现每个方法对应的 fetch 调用。",
    content: "我先读取现有 client 文件。",
    toolCalls: [
      {
        id: "call-read-client",
        name: "bash",
        arguments: '{"command":"sed -n 1,160p src/client/FileSystemClient.ts"}',
      },
    ],
  },
  {
    kind: "ToolSign",
    toolCallId: "call-read-client",
    content:
      "export type FileSystemClient = {\n  exists(path: string): Promise<boolean>\n  read(path: string): Promise<string>\n  write(path: string, text: string): Promise<void>\n}",
  },
  {
    kind: "AssistantSign",
    reasoning: "类型已经存在，client 只需要把方法映射到 endpoint。",
    content:
      "可以在 makeFileSystemClient 中为每个方法调用 call(baseUrl, method, body)。",
    toolCalls: [],
  },
]

const stdTestSigns: Array<Sign> = [
  {
    kind: "UserSign",
    content: "std 里的测试应该如何组织？",
  },
  {
    kind: "AssistantSign",
    reasoning: "测试应该跟实现放在同一个目录。",
    content:
      "建议每个模块一个 .test.ts，使用 node --test 运行，快照测试放在 snapshot/ 目录。",
    toolCalls: [],
  },
]

export const mockSessions: Array<Session> = [
  {
    id: "session-windbell-semiosis",
    workspaceId: "workspace-windbell",
    title: "风铃与符号过程",
    signs: windbellSemiosisSigns,
    createdAt: 1710000000000,
    updatedAt: 1710300000000,
  },
  {
    id: "session-windbell-mobile",
    workspaceId: "workspace-windbell",
    title: "移动端工作区界面",
    signs: windbellMobileSigns,
    createdAt: 1710000000000,
    updatedAt: 1710290000000,
  },
  {
    id: "session-meta-lisp-eval",
    workspaceId: "workspace-meta-lisp",
    title: "最小求值器",
    signs: metaLispEvalSigns,
    createdAt: 1710000000000,
    updatedAt: 1710200000000,
  },
  {
    id: "session-meta-lisp-type",
    workspaceId: "workspace-meta-lisp",
    title: "类型检查",
    signs: metaLispTypeSigns,
    createdAt: 1710000000000,
    updatedAt: 1710190000000,
  },
  {
    id: "session-fs-api-rpc",
    workspaceId: "workspace-fs-api",
    title: "RPC API 设计",
    signs: fsApiRpcSigns,
    createdAt: 1710000000000,
    updatedAt: 1710100000000,
  },
  {
    id: "session-fs-api-client",
    workspaceId: "workspace-fs-api",
    title: "生成 client 封装",
    signs: fsApiClientSigns,
    createdAt: 1710000000000,
    updatedAt: 1710090000000,
  },
  {
    id: "session-std-test",
    workspaceId: "workspace-std",
    title: "测试组织",
    signs: stdTestSigns,
    createdAt: 1710000000000,
    updatedAt: 1710050000000,
  },
]
