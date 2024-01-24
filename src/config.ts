export const ANTD_GITHUB = {
  OWNER: 'ant-design',
  REPO: 'ant-design',
  EN_DOC_NAME: 'index.en-US.md',
  ZH_DOC_NAME: 'index.zh-CN.md',
} as const;

export enum DocsLang {
  ZH = 'zh-CN',
  EN = 'en-US',
};

export const excludeDirs = ['__tests__', '_util', 'back-top', 'col', 'locale', 'row', 'style', 'theme', 'version'];

export const splitText = '____';