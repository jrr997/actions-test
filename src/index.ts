import { DocsLang, excludeDirs, splitText } from "./config";
import { getComponentDirInfos, getComponentsDocText } from "./utils";
import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core';

const recoverText = (text: string) => text.replaceAll(splitText, '-');

const token = core.getInput("token")
const ref = core.getInput("ref")

async function Main() {
  let dirInfos = await getComponentDirInfos(token, ref);

  const componentNames = dirInfos?.map(dirInfo => dirInfo.name).filter(name => !excludeDirs.includes(name));
  const componentDocsText = await getComponentsDocText(componentNames!, token, ref);

  let docsMap: any = {};
  let failDocs: any = []
  for (let key in componentDocsText) {
    const componentName = recoverText(key.slice(0, key.length - 2));

    const lang = key.slice(key.length - 2) === 'zh' ? DocsLang.ZH : DocsLang.EN;
    const text = componentDocsText[key]?.text;
    if (!docsMap[componentName]) {
      docsMap[componentName] = {};
    }
    docsMap[componentName][lang] = text;

    if (!text) {
      failDocs.push({
        componentName,
        lang,
        text,
      });
    }

  }

  failDocs.forEach(() => {
    console.log('failDocs: ', failDocs);
  })

  // used to see if this action is working successfully
  const count = Object.keys(docsMap).length;
  core.setOutput("count", count);

  // write docsMap.json
  const filePath = path.join(process.env.GITHUB_WORKSPACE!, 'docsMap.json');
  fs.writeFileSync(filePath, JSON.stringify(docsMap), 'utf8');
  const jsonString = JSON.stringify(docsMap);
  fs.writeFileSync('./dist/docsMap.json', jsonString, 'utf8');
  
}

if (ref && token) {
  Main();
}