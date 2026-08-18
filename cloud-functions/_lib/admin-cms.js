import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "portfolio_admin";
const MAX_SESSION_AGE = 1000 * 60 * 60 * 24 * 7;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function envValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];
    if (typeof value === "string" && value.trim() && value !== "undefined" && value !== "null") {
      return value.trim();
    }
  }
  return "";
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") || "";
  for (const pair of cookieHeader.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    const key = pair.slice(0, separator).trim();
    if (key !== name) continue;
    return decodeURIComponent(pair.slice(separator + 1).trim());
  }
  return "";
}

export function isAdminRequest(context) {
  const value = readCookie(context.request, COOKIE_NAME);
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) return false;
  const issuedAtNumber = Number(issuedAt);
  if (issuedAtNumber > Date.now() + 60_000 || Date.now() - issuedAtNumber > MAX_SESSION_AGE) return false;

  const password = envValue(context.env, "ADMIN_PASSWORD") || "change-me-now";
  const expected = createHmac("sha256", password).update(issuedAt).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function unauthorized() {
  return json({ message: "未登录，请刷新后台后重新登录。" }, 401);
}

function githubConfig(env) {
  const token = envValue(env, "PORTFOLIO_GITHUB_TOKEN", "GITHUB_TOKEN", "GH_TOKEN");
  if (!token) {
    throw new Error(
      "缺少 PORTFOLIO_GITHUB_TOKEN。请在 EdgeOne 项目环境变量中使用这个名称配置 GitHub Personal Access Token，并重新部署生产环境。",
    );
  }

  return {
    token,
    owner: envValue(env, "GITHUB_REPO_OWNER", "GITHUB_OWNER") || "wyp-design",
    repo: envValue(env, "GITHUB_REPO_NAME", "GITHUB_REPO") || "portfolio-2026",
    branch: envValue(env, "GITHUB_BRANCH") || "main",
  };
}

async function githubRequest(env, path, init = {}) {
  const config = githubConfig(env);
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "portfolio-2026-edgeone-cms",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.message || `${response.status} ${response.statusText}`;
    throw new Error(`GitHub API 请求失败：${detail}`);
  }
  return response;
}

async function existingFileSha(env, path) {
  const config = githubConfig(env);
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}?ref=${encodeURIComponent(config.branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portfolio-2026-edgeone-cms",
      },
    },
  );
  if (response.status === 404) return undefined;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(`读取 GitHub 文件失败：${body?.message || response.statusText}`);
  }
  const body = await response.json();
  return typeof body?.sha === "string" ? body.sha : undefined;
}

export async function commitBuffer(env, path, buffer, message) {
  const config = githubConfig(env);
  const sha = await existingFileSha(env, path);
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const body = {
    message,
    content: Buffer.from(buffer).toString("base64"),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  };
  await githubRequest(env, `/repos/${config.owner}/${config.repo}/contents/${encodedPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function checkGithub(env) {
  const config = githubConfig(env);
  await githubRequest(env, `/repos/${config.owner}/${config.repo}`);
  return { repository: `${config.owner}/${config.repo}`, branch: config.branch };
}

export function jsonResponse(data, status = 200) {
  return json(data, status);
}

export function errorResponse(message, error) {
  return json({ message, detail: error instanceof Error ? error.message : String(error) }, 500);
}
