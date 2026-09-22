# semiosis

[semiosis.js] AgentConfig 不再有 system 字段，改为调用 agentRun 时传入 SystemSign

目前 makeBashTool 这个函数的设计有问题，
因为为了实现 handle 函数，根本不需要 spec 的信息。

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
