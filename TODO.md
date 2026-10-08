# semiosis.js

现在还有哪里用到了 ErrorSign？
我们可否完全删除 ErrorSign 来避免 agent 再被卡住？

# semiosis.js

目前，我们的 agent 接口不支持 SSE 式的信息返回，
因此前端也无法渲染流式的 UI 变化，
导致在 AI 需要思考很久的时候，用户看不到响应。

现在需要解决这个问题。
你有什么方案？

---

我觉得主要的问题在于，如何保证我们现在的简洁 agent 接口设计。
可否通过给 agentInterpret 接口一个回调函数来处理这个部分 sign 输出的问题。

# windbell-web.js

改空内容时的样式。

- 比如 工作区没有对话。

# windbell-web.js

模仿 telegram 给对话设页面以及其他页面置纹样背景。

# IDE and meta-lisp

必要的功能：

- 语法高亮

可能不必要的功能：

- 初始化项目模板

通过悬浮按钮来支持的功能：

- 快速运行 scripts/ 中的脚本。
- 快速输入 prompts/ 中保存的 prompts。
- 检查当前 git diff。
