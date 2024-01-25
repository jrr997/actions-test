# Actions-For-Antd-Docs-VSCode
Fetch docs from [Ant-Design](https://github.com/ant-design/ant-design) and provide them to [Antd-Docs](https://marketplace.visualstudio.com/items?itemName=jrr997.antd-docs).

## Why this?

The [Antd-Docs](https://marketplace.visualstudio.com/items?itemName=jrr997.antd-docs) plugin allows users to view the documentation of the `ant-design` component library in `VSCode`. Its principles are as follows:

1. Use the GitHub REST API to fetch documentation.
2. Display corresponding documentation when a user hovers over a specific component.

Using the GitHub API requires users to configure a `GitHub token` in the plugin, making it not ready to use out of the box. A more challenging aspect is that `ant-design` restricts `PAT tokens`: `PAT tokens` cannot retrieve the content of `ant-design` files through the GitHub API.

Later, a solution was thought of: fork the `ant-design` repository, and the plugin fetches documentation from the forked repository. This way, the `PAT token` can be used to obtain documentation through the GitHub API. While this method is not perfect because it still requires periodically syncing with the upstream repository, GitHub Actions can automate this process.

Since GitHub Actions are already in use, it makes sense to incorporate the documentation retrieval step into the actions. Another benefit is that users no longer need to configure a token when using the plugin. That's precisely what this repository does.

## Branches

- **main branch:** Workflow source code and artifacts. Executes the workflow periodically to update the documentation and push it to the output branch.
- **output branch:** Divided into `output4` and `output`, storing documentation for antd4 and 5, respectively.

## Quick Start

1. Clone this repository and checkout from the `main` branch.
2. Run `pnpm install`.
3. Make sure to run `pnpm run build` if you modify files in the `src` directory.