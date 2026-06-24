"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project, SiteContent } from "@/content/types";
import type { PortfolioContent } from "@/lib/portfolio-data";

type SaveState = "idle" | "loading" | "saving" | "saved" | "error";

const emptyLocalized = { zh: "", en: "" };

const emptySite: SiteContent = {
  name: "",
  shortRole: emptyLocalized,
  intro: emptyLocalized,
  bio: emptyLocalized,
  aboutHeadline: emptyLocalized,
  capabilities: [],
  email: "",
  social: [],
};

function createProject(order: number): Project {
  return {
    slug: `project-${Date.now()}`,
    title: { zh: "新项目", en: "New Project" },
    summary: { zh: "项目简介", en: "Project summary" },
    year: new Date().getFullYear().toString(),
    role: { zh: "UI/UX 设计", en: "UI/UX Design" },
    category: { zh: "作品集", en: "Portfolio" },
    accent: "#285cff",
    order,
    featured: false,
    metrics: [],
    sections: [
      {
        eyebrow: { zh: "背景", en: "Context" },
        title: { zh: "项目标题", en: "Project title" },
        body: { zh: "这里写项目详情。", en: "Write project details here." },
        tone: "light",
        media: [],
      },
    ],
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => a.order - b.order);
}

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>({ site: emptySite, projects: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [projectJson, setProjectJson] = useState("");
  const [state, setState] = useState<SaveState>("loading");
  const [message, setMessage] = useState("正在检查登录状态…");

  const selectedProject = content.projects[selectedIndex];
  const sortedProjects = useMemo(() => sortProjects(content.projects), [content.projects]);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((result) => {
        if (result.authenticated) {
          setAuthenticated(true);
          void loadContent();
        } else {
          setState("idle");
          setMessage("请输入后台密码。");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("登录状态检查失败，请刷新重试。");
      });
  }, []);

  async function loadContent() {
    setState("loading");
    setMessage("正在读取后台内容…");
    const response = await fetch("/api/admin/content");
    if (!response.ok) {
      setState("error");
      setMessage("读取失败，请重新登录。");
      return;
    }

    const nextContent = (await response.json()) as PortfolioContent;
    const sortedContent = { ...nextContent, projects: sortProjects(nextContent.projects) };
    setContent(sortedContent);
    setSelectedIndex(0);
    setProjectJson(sortedContent.projects[0] ? JSON.stringify(sortedContent.projects[0], null, 2) : "");
    setState("idle");
    setMessage("内容已加载，可以开始编辑。");
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("正在登录…");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setState("error");
      setMessage("密码不正确。");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    await loadContent();
  }

  function updateSite(nextSite: Partial<SiteContent>) {
    setContent((current) => ({ ...current, site: { ...current.site, ...nextSite } }));
  }

  function updateProject(index: number, nextProject: Project) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) => (projectIndex === index ? nextProject : project)),
    }));
    if (index === selectedIndex) setProjectJson(JSON.stringify(nextProject, null, 2));
  }

  function addProject() {
    const nextProject = createProject(content.projects.length + 1);
    setContent((current) => ({ ...current, projects: [...current.projects, nextProject] }));
    setSelectedIndex(content.projects.length);
    setProjectJson(JSON.stringify(nextProject, null, 2));
  }

  function removeProject(index: number) {
    if (!confirm("确定要删除这个项目吗？")) return;
    const nextProjects = content.projects.filter((_, projectIndex) => projectIndex !== index);
    setContent((current) => ({ ...current, projects: nextProjects }));
    setSelectedIndex(0);
    setProjectJson(nextProjects[0] ? JSON.stringify(nextProjects[0], null, 2) : "");
  }

  function moveProject(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.projects.length) return;
    const projects = [...content.projects];
    const movingProject = projects[index];
    projects[index] = projects[nextIndex];
    projects[nextIndex] = movingProject;
    const orderedProjects = projects.map((project, projectIndex) => ({ ...project, order: projectIndex + 1 }));
    setContent((current) => ({ ...current, projects: orderedProjects }));
    setSelectedIndex(nextIndex);
    setProjectJson(JSON.stringify(orderedProjects[nextIndex], null, 2));
  }

  function applyProjectJson() {
    if (!selectedProject) return;
    try {
      updateProject(selectedIndex, JSON.parse(projectJson) as Project);
      setMessage("项目详情 JSON 已应用，记得点击保存发布。");
      setState("idle");
    } catch {
      setState("error");
      setMessage("JSON 格式不正确，请检查逗号、引号和括号。");
    }
  }

  async function uploadFile(file: File) {
    if (!selectedProject) return;
    setState("saving");
    setMessage(`正在上传 ${file.name} 到 GitHub…`);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const result = (await uploadResponse.json().catch(() => null)) as { detail?: string; message?: string } | null;
      setState("error");
      setMessage(`上传失败：${result?.detail || result?.message || "未知错误"}`);
      return;
    }

    const upload = (await uploadResponse.json()) as {
      fileUrl: string;
      mimeType?: string;
      originalFilename?: string;
    };
    const filename = upload.originalFilename || file.name;
    const media = {
      _type: file.type === "application/pdf" ? ("file" as const) : ("image" as const),
      url: upload.fileUrl,
      mimeType: upload.mimeType || file.type,
      originalFilename: filename,
      alt: { zh: filename, en: filename },
    };

    const nextProject: Project = {
      ...selectedProject,
      sections: selectedProject.sections.length
        ? selectedProject.sections.map((section, sectionIndex) =>
            sectionIndex === 0
              ? { ...section, media: [...(section.media || []), media] }
              : section,
          )
        : [
            {
              eyebrow: { zh: "素材", en: "Media" },
              title: { zh: "项目素材", en: "Project media" },
              body: { zh: "后台上传的项目素材。", en: "Uploaded project media." },
              tone: "light",
              media: [media],
            },
          ],
    };

    updateProject(selectedIndex, nextProject);
    setState("idle");
    setMessage("文件已提交到 GitHub，并已加入当前项目。点击保存发布后，等待 EdgeOne 重新部署生效。");
  }

  async function saveContent() {
    setState("saving");
    setMessage("正在保存到 GitHub…");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...content,
        projects: content.projects.map((project, index) => ({ ...project, order: index + 1 })),
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { detail?: string; message?: string } | null;
      setState("error");
      setMessage(`保存失败：${result?.detail || result?.message || "请确认 GITHUB_TOKEN 已配置。"}`);
      return;
    }

    const saved = (await response.json()) as PortfolioContent & { message?: string };
    const sortedSaved = { ...saved, projects: sortProjects(saved.projects) };
    setContent(sortedSaved);
    setProjectJson(sortedSaved.projects[selectedIndex] ? JSON.stringify(sortedSaved.projects[selectedIndex], null, 2) : "");
    setState("saved");
    setMessage(saved.message || "已提交到 GitHub。等待 EdgeOne 自动重新部署后，前台会更新。");
  }

  async function checkGithub() {
    setState("loading");
    setMessage("正在检测 GitHub Token…");
    const response = await fetch("/api/admin/github-check");
    const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; detail?: string } | null;

    if (!response.ok || !result?.ok) {
      setState("error");
      setMessage(`GitHub 检测失败：${result?.detail || result?.message || "未知错误"}`);
      return;
    }

    setState("saved");
    setMessage(result.message || "GitHub Token 已配置。");
  }

  if (!authenticated) {
    return (
      <main className="admin-shell admin-login">
        <form onSubmit={login} className="admin-card">
          <span>PORTFOLIO ADMIN</span>
          <h1>进入作品集后台</h1>
          <p>输入后台密码后，你可以修改网站文案、项目内容和上传作品素材。</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="后台密码"
          />
          <button type="submit" disabled={state === "loading"}>登录</button>
          <small>{message}</small>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <span>PORTFOLIO CMS</span>
          <h1>作品集后台</h1>
        </div>
        <div className="admin-actions">
          <a href="/" target="_blank">打开前台</a>
          <button className="secondary" onClick={checkGithub} disabled={state === "saving" || state === "loading"}>
            检测 GitHub
          </button>
          <button onClick={saveContent} disabled={state === "saving" || state === "loading"}>保存发布</button>
        </div>
      </header>

      <p className={`admin-message admin-message-${state}`}>{message}</p>

      <section className="admin-grid">
        <aside className="admin-panel">
          <h2>站点信息</h2>
          <label>
            姓名 / Logo
            <input value={content.site.name} onChange={(event) => updateSite({ name: event.target.value })} />
          </label>
          <label>
            邮箱
            <input value={content.site.email} onChange={(event) => updateSite({ email: event.target.value })} />
          </label>
          <label>
            中文职业定位
            <input
              value={content.site.shortRole.zh}
              onChange={(event) => updateSite({ shortRole: { ...content.site.shortRole, zh: event.target.value } })}
            />
          </label>
          <label>
            English role
            <input
              value={content.site.shortRole.en}
              onChange={(event) => updateSite({ shortRole: { ...content.site.shortRole, en: event.target.value } })}
            />
          </label>
          <label>
            中文首页简介
            <textarea
              value={content.site.intro.zh}
              onChange={(event) => updateSite({ intro: { ...content.site.intro, zh: event.target.value } })}
            />
          </label>
          <label>
            English intro
            <textarea
              value={content.site.intro.en}
              onChange={(event) => updateSite({ intro: { ...content.site.intro, en: event.target.value } })}
            />
          </label>
        </aside>

        <section className="admin-panel admin-projects">
          <div className="admin-panel-heading">
            <h2>项目列表</h2>
            <button onClick={addProject}>新增项目</button>
          </div>

          <div className="admin-project-list">
            {sortedProjects.map((project, index) => (
              <button
                className={index === selectedIndex ? "is-selected" : ""}
                key={project.slug}
                onClick={() => {
                  setSelectedIndex(index);
                  setProjectJson(JSON.stringify(project, null, 2));
                }}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{project.title.zh || project.title.en}</strong>
                <small>{project.year} · {project.slug}</small>
              </button>
            ))}
          </div>
        </section>

        {selectedProject ? (
          <section className="admin-panel admin-editor">
            <div className="admin-panel-heading">
              <h2>编辑项目</h2>
              <div>
                <button onClick={() => moveProject(selectedIndex, -1)}>上移</button>
                <button onClick={() => moveProject(selectedIndex, 1)}>下移</button>
                <button className="danger" onClick={() => removeProject(selectedIndex)}>删除</button>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Slug
                <input
                  value={selectedProject.slug}
                  onChange={(event) => updateProject(selectedIndex, { ...selectedProject, slug: slugify(event.target.value) })}
                />
              </label>
              <label>
                年份
                <input
                  value={selectedProject.year}
                  onChange={(event) => updateProject(selectedIndex, { ...selectedProject, year: event.target.value })}
                />
              </label>
              <label>
                主题色
                <input
                  type="color"
                  value={selectedProject.accent}
                  onChange={(event) => updateProject(selectedIndex, { ...selectedProject, accent: event.target.value })}
                />
              </label>
              <label>
                中文标题
                <input
                  value={selectedProject.title.zh}
                  onChange={(event) =>
                    updateProject(selectedIndex, {
                      ...selectedProject,
                      title: { ...selectedProject.title, zh: event.target.value },
                    })
                  }
                />
              </label>
              <label>
                English title
                <input
                  value={selectedProject.title.en}
                  onChange={(event) =>
                    updateProject(selectedIndex, {
                      ...selectedProject,
                      title: { ...selectedProject.title, en: event.target.value },
                    })
                  }
                />
              </label>
              <label>
                中文摘要
                <textarea
                  value={selectedProject.summary.zh}
                  onChange={(event) =>
                    updateProject(selectedIndex, {
                      ...selectedProject,
                      summary: { ...selectedProject.summary, zh: event.target.value },
                    })
                  }
                />
              </label>
              <label>
                English summary
                <textarea
                  value={selectedProject.summary.en}
                  onChange={(event) =>
                    updateProject(selectedIndex, {
                      ...selectedProject,
                      summary: { ...selectedProject.summary, en: event.target.value },
                    })
                  }
                />
              </label>
            </div>

            <div className="admin-upload">
              <label>
                上传 PNG / JPG / GIF / PDF
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,video/mp4"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadFile(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            <label className="admin-json">
              项目完整内容 JSON
              <textarea value={projectJson} onChange={(event) => setProjectJson(event.target.value)} />
            </label>
            <button className="secondary" onClick={applyProjectJson}>应用 JSON 到当前项目</button>
          </section>
        ) : null}
      </section>
    </main>
  );
}
