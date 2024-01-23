const core = require("@actions/core");
const github = require("@actions/github");
const fs = require('fs');
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

enum DocsLang {
  ZH = 'zh-CN',
  EN = 'en-US',
};

const excludeDirs = ['__tests__', '_util', 'back-top', 'col', 'locale', 'row', 'style', 'theme', 'version'];

const ANTD_GITHUB = {
  OWNER: 'ant-design',
  REPO: 'ant-design',
  EN_DOC_NAME: 'index.en-US.md',
  ZH_DOC_NAME: 'index.zh-CN.md',
} as const;

const splitText = '____';

const recoverText = (text: string) => text.replaceAll(splitText, '-');

// Access GITHUB_TOKEN
const token = process.env.GITHUB_TOKEN!;

const getAntdContent = (path: string, token: string, ref?: string) =>
  new Octokit({ auth: token }).rest.repos.getContent({
    // owner: ANTD_GITHUB.OWNER,
    owner: "ant-design",
    repo: "ant-design",
    path,
    ref,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

const getComponentDirInfos = async (token: string, ref: string) => {
  try {
    const response = await getAntdContent('/components', token, ref);
    const { data } = response;
    if (Array.isArray(data)) {
      const componentDirInfos = data.filter(item => item.type === 'dir');
      return componentDirInfos;
    }
  } catch (e: any) {
    console.error('retrieving component dirs failed: ', e);
    if (e.status === 401) {
      console.log('github token invalid');
    } else {
      console.log('e.response.data.message');
    }
    return [];
  }
};

const getComponentsDocText = async (componentNames: string[], token: string, ref: string) => {
  const queries = componentNames?.map(componentName => createQuery(componentName, ref));
  const { repository } = await graphql<{ repository: Record<string, null | { text: string }> }>(
    `
query{
  repository(owner: "${ANTD_GITHUB.OWNER}", name: "${ANTD_GITHUB.REPO}") {
    ${queries.join('\n')}
  }
}
    `,
    {
      headers: {
        authorization: `token ${token}`,
      },
    }
  );
  return repository;
};

const createQuery = (componentName: string, ref: string) => {
  const zhName = `${componentName.replaceAll('-', splitText)}zh`;
  const enName = `${componentName.replaceAll('-', splitText)}en`;
  return `
      ${zhName}: object(expression: "${ref}:components/${componentName}/${ANTD_GITHUB.ZH_DOC_NAME}") {
        ... on Blob {
          text
        }
      }
      ${enName}: object(expression: "${ref}:components/${componentName}/${ANTD_GITHUB.EN_DOC_NAME}") {
        ... on Blob {
          text
        }
      }
  `;
};

const ref = core.getInput("ref")

async function Main() {
  if (!ref) {
    console.log('ref is required');
    return;
  }
  let dirInfos = await getComponentDirInfos(token, ref);
  const componentNames = dirInfos?.map(dirInfo => dirInfo.name).filter(name => !excludeDirs.includes(name));
  const componentDocsText = await getComponentsDocText(componentNames!, token, ref);

  // 将对象转换为 JSON 字符串
  const jsonString = JSON.stringify(componentDocsText);

  // 将 JSON 字符串写入文件
  fs.writeFileSync('rawText.json', jsonString, 'utf8');

  core.setOutput("docsMap", '123');
  const time = new Date().toTimeString();
  core.setOutput("time", time);
}

Main();
