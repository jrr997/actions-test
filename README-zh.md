# Actions-For-Antd-Docs-VSCode
从 [Ant-Design](https://github.com/ant-design/ant-design) 仓库获取组件文档并提供给  [Antd-Docs](https://marketplace.visualstudio.com/items?itemName=jrr997.antd-docs).

## 为什么?

[Antd-Docs](https://marketplace.visualstudio.com/items?itemName=jrr997.antd-docs) 插件可以让用户在 `VSCode` 中查看 `ant-design` 组件库的文档，其原理是：

1. 利用 github rest api 获取文档。
2. 用户在 hover 某个组件时展示对应的文档。

使用 github api 需要用户在插件中配置 `github token`，这使得插件无法开箱即用。更棘手的一点是，`ant-design` 对 `PAT token` 做了限制：`PAT token` 无法通过 github api 获取 `ant-design` 的文件内容，必须是其他 token。

后来想到了一个解决方法：fork `ant-design` 仓库，插件从 forked 的仓库获取文档，这样 `PAT token` 就能用 github api 获取文档。这个方法并不完美，因为还要定时 sync upstream，可以利用 github actions 来自动化这个操作。

既然都上 github actions 了，干脆把获取文档这个步骤也做到 actions 里，这样做的另一个好处是用户使用插件时不再需要配置 token。这个仓库做的就是这个事情。

## 分支

- **main 分支:** workflow 源码和产物。定期执行 workflow 更新文档，并把文档推送到 output 分支。
- **output 分支:** 分为 output4 和 output5，分别存储 antd4 和 5 的文档。

## 快速开始

1. 克隆本仓库并切换到 `main` 分支.
2. 安装依赖： `pnpm install`.
3. 如果修改了 `src` 目录下的文件，请运行 `pnpm run build`。