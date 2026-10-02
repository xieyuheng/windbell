# semiosis.js

目前 command 是：

```
  xyh@lattice /home/xyh/projects/xieyuheng/windbell (master)
$ ./bin/semiosis
semiosis.js 0.1.0
commands:
  provider-list -- list supported providers
  model-enable <model-name> --provider <provider-name> -- enable a model
  model-list --provider <provider-name> --all -- list models (use --all to include disabled models)
  repl --provider <provider-name> --model <model-name> --session <session-id> -- start agent repl in current directory
  batch --provider <provider-name> --model <model-name> --prompts <file> --cwd <dir> --max-output-chars <n> -- run prompts through agent
```

是否应该做成两级的 command：

```
  provider list
  model enable
  model list
  repl
  batch
```

或：

```
  provider list
  model enable
  model list
  agent repl
  agent batch
```

用 cli command 实现 provider api-keys 的填写和删除
用 cli command 实现 default provider 选择
用 cli command 实现 default model 选择
用 cli command 实现 model disable

用 repl 命令 实现 provider 和 model 的切换

# windbell-web.js

实现所支持的 provider 和 model 的展示页面
实现 provider api-keys 的填写和删除
实现 default provider 选择
实现 default model 选择
实现 model disable

# meta-lisp

IDE 如何与 meta-lisp 结合？

- 初始化项目模板
- 语法高亮
- 按照惯例运行 scripts/ 中的脚本

# windbell-web.js

配色可配置

# windbell-web.js

模仿 telegram 给对话设页面以及其他页面置纹样背景。

# windbell database

用 git 管理 ~/.windbell 文件夹

- 自己尝试，先不要做成功能
- 未来可以考虑做 git-api.js
  - 本地部署 git 管理工具
