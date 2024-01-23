const core = require("@actions/core");
const github = require("@actions/github");
const fs = require('fs');
const path = require('path');
import { Octokit } from '@octokit/rest';

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

// Access GITHUB_TOKEN
// const token = process.env.GITHUB_TOKEN!;
const token = core.getInput("token")

console.log('token: ', token);
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

const ref = core.getInput("ref")

async function Main() {
  if (!ref) {
    console.log('ref is required');
    return;
  }
  if (!token) {
    console.log('token is required');
    return;
  }
  let dirInfos = await getComponentDirInfos(token, ref);

  const zhPromises = dirInfos
    ?.map(dirInfo => getAntdContent(`${dirInfo.path}/${ANTD_GITHUB.ZH_DOC_NAME}`, token, ref));
  const enPromises = dirInfos

    ?.map(dirInfo => getAntdContent(`${dirInfo.path}/${ANTD_GITHUB.EN_DOC_NAME}`, token, ref));
  try {
    const res = await Promise.allSettled([...zhPromises!, ...enPromises!]);
    let docsMap: any = {};

    res.filter((item) => item.status !== 'fulfilled').forEach(item => {
      console.log('fail: ', item);
    });

    res.filter((item) => item.status === 'fulfilled')
      .forEach((item: any) => {
        const { path, encoding, content, name } = item.value.data;
        const parsedContent = Buffer.from(content, encoding).toString();
        const componentName = path.split('/')[1];
        const lang = name.split('.')[1] as DocsLang;
        if (!docsMap[componentName]) {
          docsMap[componentName] = {};
        }
        docsMap[componentName][lang] = parsedContent;
      });

    const filePath = path.join(process.env.GITHUB_WORKSPACE, 'docsMap.json');
    fs.writeFileSync(filePath, JSON.stringify(docsMap), 'utf8');

    const jsonString = JSON.stringify(docsMap);

    fs.writeFileSync('docsMap.json', jsonString, 'utf8');

    const time = new Date().toTimeString();
    core.setOutput("time", time);

  } catch (e) {
    console.log(e);
  }

}

Main();