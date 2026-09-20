# windbell

[windbell] unifont 字体

下面我想要支持字体的选择，
默认字体使用 unifont，
也可以在设置中选择用系统字体。

unifont 的文件在 ~/unifont-18.0.01.otf

问题：

- 应该如何使用这个字体？
  是否应该设置：
  - public/assets/fonts？
  - 或 assets/fonts？
  - 或 public/fonts？
  - 或 fonts？

[windbell] 我计划设计 从左到右四级页面

(1) projects -- 项目列表，每个项目对应一个本地路径
 - sessions -- 对话列表

(2) session -- 一个对话的页面
- signs -- 对话中的符号列表

(3) file tree -- IDE 的文件浏览器，从项目的根目录开始

(4) markdown file -- 对文件的预览，包括文学式编程支持

下面我们首先讨论 (1)

[windbell] 支持 markdown 的极简 IDE

- 手机上 可以是 file tree 在下面，
  markdown 的预览在上面，
  类似 ranger，但是宽度不够，
  所以用高度。

# agent

为 semiosis.js package 增加文学式编程文档
