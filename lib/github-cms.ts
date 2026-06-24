import { Buffer } from "node:buffer";
import { getErrorMessage } from "./error-message";

const DEFAULT_OWNER = "wyp-design";
const DEFAULT_REPO = "portfolio-2026";
const DEFAULT_BRANCH = "main";

function getGithubConfig() {
  return {
    owner: process.env.GITHUB_REPO_OWNER || DEFAULT_OWNER,
    repo: process.env.GITHUB_REPO_NAME || DEFAULT_REPO,
    branch: process.env.GITHUB_BRANCH || DEFAULT_BRANCH,
    token: process.env.GITHUB_TOKEN,
  };
}

function assertGithubToken(token?: string): asserts token is string {
  if (!token) {
    throw new Error("缺少 GITHUB_TOKEN。请在 EdgeOne 项目环境变量里添加 GitHub Personal Access Token。");
  }
}

async function githubRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { owner, repo, token } = getGithubConfig();
  assertGithubToken(token);

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`GitHub API ${response.status}: ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

async function getFileSha(filePath: string) {
  const { branch } = getGithubConfig();

  try {
    const result = await githubRequest<{ sha?: string }>(
      `/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`,
      { method: "GET" },
    );
    return result.sha;
  } catch (error) {
    const message = getErrorMessage(error);
    if (message.includes("GitHub API 404")) return undefined;
    throw error;
  }
}

export async function commitTextFile(filePath: string, text: string, message: string) {
  const { branch } = getGithubConfig();
  const sha = await getFileSha(filePath);

  return githubRequest(`/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      branch,
      content: Buffer.from(text, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function commitJsonFile(filePath: string, value: unknown, message: string) {
  return commitTextFile(filePath, `${JSON.stringify(value, null, 2)}\n`, message);
}

export async function commitBinaryFile(filePath: string, bytes: ArrayBuffer, message: string) {
  const { branch } = getGithubConfig();
  const sha = await getFileSha(filePath);

  return githubRequest(`/contents/${encodeURIComponent(filePath).replace(/%2F/g, "/")}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      branch,
      content: Buffer.from(bytes).toString("base64"),
      ...(sha ? { sha } : {}),
    }),
  });
}
