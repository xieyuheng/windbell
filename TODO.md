# windbell-web.js

[windbell-web.js] 改善 session-list 使用体验

下面给 session card 增加 toolbar，
直接放入 header，在 title 之外另起一行，
向左对齐。
toolbar 不需要抽成组件，
toolbar 中可以有多个工具按钮：

- 删除当前 session
- 修改 session title

# semiosis-api.js

[semiosis-api.js]

在删除 session 的 api 之外，
我想要设计把 session 放入回收站：
- dustbin/sessions
的 API。

# windbell-web.js

[windbell-web.js] 改善 workspace-list 使用体验

[windbell-web.js] file tree -- IDE 的文件浏览器，从项目的根目录开始

[windbell-web.js] markdown file -- 对文件的预览，包括文学式编程支持

[windbell-web.js] 支持 markdown 的极简 IDE

- 手机上 可以是 file tree 在下面，
  markdown 的预览在上面，
  类似 ranger，但是宽度不够，
  所以用高度。
