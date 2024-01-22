const core = require("@actions/core");
const github = require("@actions/github");
import { Octokit } from '@octokit/rest';

// Access GITHUB_TOKEN
const githubToken = process.env.GITHUB_TOKEN;

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
  
try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  getAntdContent('/components', githubToken!, 'master').then(response => {
    console.log(response);
    const { data } = response;
    if (Array.isArray(data)) {
      const componentDirInfos = data.filter(item => item.type === 'dir').map(item => item.name);
      core.setOutput("dir", componentDirInfos?.[0]);

    }
  });
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2);
  // console.log(`The event payload: ${payload}`);
} catch (error: any) {
  core.setFailed(error.message);
}
