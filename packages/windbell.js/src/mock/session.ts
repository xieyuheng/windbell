import type { Sign } from "@xieyuheng/semiosis.js"
import type { Session } from "../models/Session"

export const mockSessions: Array<Session> = [
  {
    id: "session-windbell-semiosis",
    workspaceId: "workspace-windbell",
    title: "风铃与符号过程",
    signs: [
      {
        kind: "PersonaSign",
        content: "You are a helpful software engineer assistant.",
      },
      {
        kind: "UserSign",
        content: "请解释风铃和符号过程的关系。",
      },
      {
        kind: "ReasoningSign",
        content: "风铃不是一个对象，而是一个把风转译为声音的符号过程。",
      },
      {
        kind: "AssistantSign",
        content: "风本身不可见，它必须经过风铃才能被听见。",
      },
    ],
    createdAt: 1710000000000,
    updatedAt: 1710300000000,
  },
  {
    id: "session-windbell-mobile",
    workspaceId: "workspace-windbell",
    title: "移动端工作区界面",
    signs: [
      {
        kind: "UserSign",
        content: "移动端选择工作区和对话的界面，应该用卡片还是列表？",
      },
      {
        kind: "ReasoningSign",
        content: "工作区数量少，适合卡片；对话数量会增长，适合列表行。",
      },
      {
        kind: "AssistantSign",
        content: "建议移动端用堆栈导航：工作区 -> 对话列表 -> 对话页面。",
      },
    ],
    createdAt: 1710000000000,
    updatedAt: 1710290000000,
  },
  {
    id: "session-meta-lisp-eval",
    workspaceId: "workspace-meta-lisp",
    title: "最小求值器",
    signs: [
      {
        kind: "UserSign",
        content: "帮我设计一个最小的表达式求值器。",
      },
      { kind: "ReasoningSign", content: "先看当前实现。" },
      { kind: "AssistantSign", content: "我先读取 src/eval.ts。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-read-eval",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-read-eval",
        content:
          'export function evaluate(input: string): unknown {\n  throw new Error("not implemented")\n}',
      },
      { kind: "ReasoningSign", content: "当前实现只有入口函数。" },
      {
        kind: "AssistantSign",
        content: "可以先做字面量、变量和函数调用三种节点。",
      },
    ],
    createdAt: 1710000000000,
    updatedAt: 1710200000000,
  },
  {
    id: "session-fs-api-rpc",
    workspaceId: "workspace-fs-api",
    title: "RPC API 设计",
    signs: [
      {
        kind: "UserSign",
        content: "fs-api 应该用 REST 还是 RPC？",
      },
      { kind: "ReasoningSign", content: "文件系统操作更像 RPC。" },
      {
        kind: "AssistantSign",
        content: "建议每个方法一个 POST endpoint，参数放 JSON body。",
      },
      {
        kind: "UserSign",
        content: "先看一下当前的文件结构。",
      },
      { kind: "ReasoningSign", content: "用 bash 快速查看目录。" },
      { kind: "AssistantSign", content: "我列出 src 下的目录结构。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-list",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-list",
        content:
          "src/client/FileSystemClient.ts\nsrc/index.ts\nsrc/server/handleFileSystemRequest.ts",
      },
    ],
    createdAt: 1710000000000,
    updatedAt: 1710100000000,
  },
  {
    id: "session-std-test",
    workspaceId: "workspace-std",
    title: "测试组织",
    signs: [
      {
        kind: "UserSign",
        content: "std 里的测试应该如何组织？",
      },
      { kind: "ReasoningSign", content: "测试应该跟实现放在同一个目录。" },
      {
        kind: "AssistantSign",
        content: "建议每个模块一个 .test.ts，使用 node --test 运行。",
      },
    ],
    createdAt: 1710000000000,
    updatedAt: 1710050000000,
  },
  {
    id: "session-windbell-1",
    workspaceId: "workspace-windbell",
    title: "Markdown 编辑器布局",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：windbell 的界面应该如何继续迭代？",
      },
      { kind: "ReasoningSign", content: "第 1 轮思考：先查看当前文件结构。" },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-windbell-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-windbell-1",
        content: "bash 输出：第 1 轮。",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮总结：界面应该保持轻、静、透。",
      },
      { kind: "AssistantSign", content: "第 1 轮结论：先减少固定结构。" },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-windbell-2",
    workspaceId: "workspace-windbell",
    title: "Sign Timeline 的滚动行为",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：windbell 的界面应该如何继续迭代？",
      },
      { kind: "ReasoningSign", content: "第 2 轮思考：先查看当前文件结构。" },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-windbell-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-windbell-2",
        content: "bash 输出：第 2 轮。",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮总结：界面应该保持轻、静、透。",
      },
      { kind: "AssistantSign", content: "第 2 轮结论：先减少固定结构。" },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-windbell-3",
    workspaceId: "workspace-windbell",
    title: "移动端设置入口",
    signs: [
      {
        kind: "UserSign",
        content: "第 3 轮：windbell 的界面应该如何继续迭代？",
      },
      { kind: "ReasoningSign", content: "第 3 轮思考：先查看当前文件结构。" },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-windbell-3",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-windbell-3",
        content: "bash 输出：第 3 轮。",
      },
      {
        kind: "ReasoningSign",
        content: "第 3 轮总结：界面应该保持轻、静、透。",
      },
      { kind: "AssistantSign", content: "第 3 轮结论：先减少固定结构。" },
    ],
    createdAt: 1710000300000,
    updatedAt: 1710000300000,
  },
  {
    id: "session-windbell-4",
    workspaceId: "workspace-windbell",
    title: "设计系统颜色收敛",
    signs: [
      {
        kind: "UserSign",
        content: "第 4 轮：windbell 的界面应该如何继续迭代？",
      },
      { kind: "ReasoningSign", content: "第 4 轮思考：先查看当前文件结构。" },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-windbell-4",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-windbell-4",
        content: "bash 输出：第 4 轮。",
      },
      {
        kind: "ReasoningSign",
        content: "第 4 轮总结：界面应该保持轻、静、透。",
      },
      { kind: "AssistantSign", content: "第 4 轮结论：先减少固定结构。" },
    ],
    createdAt: 1710000400000,
    updatedAt: 1710000400000,
  },
  {
    id: "session-meta-lisp-1",
    workspaceId: "workspace-meta-lisp",
    title: "表达式求值器的 AST",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：meta-lisp 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：先查看 meta-lisp 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-meta-lisp-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-meta-lisp-1",
        content: "bash 输出：meta-lisp 第 1 轮。",
      },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-meta-lisp-2",
    workspaceId: "workspace-meta-lisp",
    title: "作用域与环境模型",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：meta-lisp 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：先查看 meta-lisp 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-meta-lisp-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-meta-lisp-2",
        content: "bash 输出：meta-lisp 第 2 轮。",
      },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-fs-api-1",
    workspaceId: "workspace-fs-api",
    title: "RPC 错误格式设计",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：fs-api 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：先查看 fs-api 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-fs-api-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-fs-api-1",
        content: "bash 输出：fs-api 第 1 轮。",
      },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-fs-api-2",
    workspaceId: "workspace-fs-api",
    title: "类型化 client 封装",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：fs-api 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：先查看 fs-api 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-fs-api-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-fs-api-2",
        content: "bash 输出：fs-api 第 2 轮。",
      },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-std-1",
    workspaceId: "workspace-std",
    title: "快照测试的组织方式",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：std 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：先查看 std 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-std-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-std-1",
        content: "bash 输出：std 第 1 轮。",
      },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-std-2",
    workspaceId: "workspace-std",
    title: "字符串工具函数设计",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：std 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：先查看 std 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-std-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-std-2",
        content: "bash 输出：std 第 2 轮。",
      },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-literate-1",
    workspaceId: "workspace-literate",
    title: "代码块与正文的交叉引用",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：literate 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：先查看 literate 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-literate-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-literate-1",
        content: "bash 输出：literate 第 1 轮。",
      },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-literate-2",
    workspaceId: "workspace-literate",
    title: "文学式编程的文档结构",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：literate 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：先查看 literate 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-literate-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-literate-2",
        content: "bash 输出：literate 第 2 轮。",
      },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-semiosis-1",
    workspaceId: "workspace-semiosis",
    title: "Sign 的连续解释",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：semiosis 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：先查看 semiosis 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-semiosis-1",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-semiosis-1",
        content: "bash 输出：semiosis 第 1 轮。",
      },
    ],
    createdAt: 1710000100000,
    updatedAt: 1710000100000,
  },
  {
    id: "session-semiosis-2",
    workspaceId: "workspace-semiosis",
    title: "工具结果的符号化",
    signs: [
      {
        kind: "UserSign",
        content: "第 2 轮：semiosis 当前最重要的问题是什么？",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：先查看 semiosis 的目录结构。",
      },
      { kind: "AssistantSign", content: "我先用 bash 查看当前目录。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-semiosis-2",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-semiosis-2",
        content: "bash 输出：semiosis 第 2 轮。",
      },
    ],
    createdAt: 1710000200000,
    updatedAt: 1710000200000,
  },
  {
    id: "session-windbell-long",
    workspaceId: "workspace-windbell",
    title: "超长对话：滚动测试",
    signs: [
      {
        kind: "UserSign",
        content: "第 1 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 1 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 1 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 2 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 2 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 2 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 3 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 3 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 3 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 4 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 4 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 4 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 5 轮：继续展开这个符号过程。",
      },
      { kind: "ReasoningSign", content: "第 5 轮思考：先查看当前上下文。" },
      { kind: "AssistantSign", content: "我先用 bash 查看相关文件。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-long-5",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-long-5",
        content: "bash 输出：第 5 轮。",
      },
      {
        kind: "UserSign",
        content: "第 6 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 6 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 6 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 7 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 7 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 7 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 8 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 8 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 8 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 9 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 9 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 9 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 10 轮：继续展开这个符号过程。",
      },
      { kind: "ReasoningSign", content: "第 10 轮思考：先查看当前上下文。" },
      { kind: "AssistantSign", content: "我先用 bash 查看相关文件。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-long-10",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-long-10",
        content: "bash 输出：第 10 轮。",
      },
      {
        kind: "UserSign",
        content: "第 11 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 11 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 11 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 12 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 12 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 12 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 13 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 13 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 13 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 14 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 14 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 14 轮回答：风经过风铃时，声音是新的符号。",
      },
      {
        kind: "UserSign",
        content: "第 15 轮：继续展开这个符号过程。",
      },
      { kind: "ReasoningSign", content: "第 15 轮思考：先查看当前上下文。" },
      { kind: "AssistantSign", content: "我先用 bash 查看相关文件。" },
      {
        kind: "ToolCallSign",
        toolCall: {
          id: "call-long-15",
          name: "bash",
          arguments: '{"command":"ls -la"}',
        },
      },
      {
        kind: "ToolOutputSign",
        toolCallId: "call-long-15",
        content: "bash 输出：第 15 轮。",
      },
      {
        kind: "UserSign",
        content: "第 16 轮：继续展开这个符号过程。",
      },
      {
        kind: "ReasoningSign",
        content: "第 16 轮思考：符号不是终点，而是下一个解释的起点。",
      },
      {
        kind: "AssistantSign",
        content: "第 16 轮回答：风经过风铃时，声音是新的符号。",
      },
    ],
    createdAt: 1710300000000,
    updatedAt: 1710300000000,
  },
]
