# semiosis

[semiosis.js] 下面我要设计 Session 类型

- ~/.windbell/database/sessions/<session-id>/

  - index.json -- 保存 Session 类型相关的数据

  - context/ -- 一个 .md 或 .json 文件，一个 sign。
    文件名前缀为长度为 4 的序号，从 0000 开始，
    0000-<sign-type-name>.md 或 .json -- 比如 PersonaSign 就是 persona，
    ToolCallSign 就是 tool-call。

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
