# semiosis

[semiosis.js] 设计 ToolRouter 与 ToolRoute

并且用 router.defineTool(sign, handler) 的方式注册 tool。

agent 带有 toolRouter 字段。

我们可以设置 defaultToolRouter，
在构造 agent 的时候传入。



[semiosis.js] assistant sign 也许应该被分解为

- inquiry sign -- 带有 tool call 的
- anchor sign -- 不带 tool call 的

# windbell

[windbell] workspace manager

- 项目列表，每个项目对应一个本地路径

[windbell] session -- 一个对话的页面

- signs -- 对话中的符号列表

[windbell] file tree -- IDE 的文件浏览器，从项目的根目录开始

[windbell] markdown file -- 对文件的预览，包括文学式编程支持

[windbell] 支持 markdown 的极简 IDE

- 手机上 可以是 file tree 在下面，
  markdown 的预览在上面，
  类似 ranger，但是宽度不够，
  所以用高度。

# agent

为 semiosis.js package 增加文学式编程文档
