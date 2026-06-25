"use client";

import { useEffect, useMemo, useState } from "react";
import type { HomeSection, LocalizedText, Project, RichTextStyle, SiteContent, UploadedMedia } from "@/content/types";
import type { PortfolioContent } from "@/lib/portfolio-data";

type SaveState = "idle" | "loading" | "saving" | "saved" | "error";
type ProjectSection = Project["sections"][number];
type ProjectMedia = NonNullable<ProjectSection["media"]>[number];
type Tone = NonNullable<ProjectSection["tone"]>;

const emptyLocalized: LocalizedText = { zh: "", en: "" };

const emptySite: SiteContent = {
  name: "",
  sections: [],
  shortRole: emptyLocalized,
  location: emptyLocalized,
  heroTitle: {
    line1: emptyLocalized,
    line2: emptyLocalized,
  },
  intro: emptyLocalized,
  heroIndex: "001 / PORTFOLIO / 2026",
  scrollLabel: emptyLocalized,
  manifestoIntro: emptyLocalized,
  manifestoLine1: emptyLocalized,
  manifestoLine2: emptyLocalized,
  workLabel: emptyLocalized,
  workIntro: emptyLocalized,
  bio: emptyLocalized,
  bioStyle: { fontSize: "medium", fontWeight: "regular" },
  aboutLabel: emptyLocalized,
  aboutHeadline: emptyLocalized,
  education: {
    school: emptyLocalized,
    degree: emptyLocalized,
    time: emptyLocalized,
    description: emptyLocalized,
    link: "",
    style: { fontSize: "small", fontWeight: "regular" },
  },
  experiences: [],
  contactLabel: emptyLocalized,
  contactHeadline: emptyLocalized,
  email: "",
  social: [],
};

function createSection(): ProjectSection {
  return {
    eyebrow: { zh: "背景", en: "Context" },
    title: { zh: "项目标题", en: "Project title" },
    body: { zh: "这里写项目详情。", en: "Write project details here." },
    tone: "light",
    media: [],
  };
}

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
    status: { zh: "样板案例", en: "Sample case" },
    externalUrl: "",
    metrics: [],
    sections: [createSection()],
  };
}

function createExperience() {
  return {
    company: { zh: "公司名称", en: "Company name" },
    position: { zh: "职位", en: "Position" },
    time: { zh: "时间", en: "Time" },
    description: { zh: "填写工作经历简介。", en: "Write experience summary." },
    link: "",
    style: { fontSize: "small", fontWeight: "regular" } as RichTextStyle,
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

function validateContent(content: PortfolioContent) {
  if (!content.site.name.trim()) return "请填写姓名 / Logo。";
  if (!content.site.email.trim()) return "请填写邮箱。";
  if (!content.projects.length) return "至少需要保留一个项目。";

  const slugs = new Set<string>();
  for (const project of content.projects) {
    if (!project.slug.trim()) return "每个项目都需要填写 Slug。";
    if (slugs.has(project.slug)) return `项目 Slug 重复：${project.slug}`;
    slugs.add(project.slug);
    if (!project.title.zh.trim() && !project.title.en.trim()) return `项目 ${project.slug} 需要填写标题。`;
  }

  return "";
}

function localizedValue(value: LocalizedText | undefined): LocalizedText {
  return value || { zh: "", en: "" };
}

function styleValue(value: RichTextStyle | undefined): RichTextStyle {
  return {
    fontSize: value?.fontSize || "medium",
    fontWeight: value?.fontWeight || "regular",
  };
}

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>({ site: emptySite, projects: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploadSectionIndex, setUploadSectionIndex] = useState(0);
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
    setUploadSectionIndex(0);
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

  function updateSiteLocalized(key: keyof SiteContent, nextValue: LocalizedText) {
    updateSite({ [key]: nextValue } as Partial<SiteContent>);
  }

  function updateHomeSection(sectionIndex: number, nextSection: HomeSection) {
    const sections = [...content.site.sections];
    sections[sectionIndex] = nextSection;
    updateSite({ sections });
  }

  function moveHomeSection(sectionIndex: number, direction: -1 | 1) {
    const nextIndex = sectionIndex + direction;
    if (nextIndex < 0 || nextIndex >= content.site.sections.length) return;
    const sections = [...content.site.sections];
    const moving = sections[sectionIndex];
    sections[sectionIndex] = sections[nextIndex];
    sections[nextIndex] = moving;
    updateSite({ sections: sections.map((section, index) => ({ ...section, order: index + 1 })) });
  }

  function updateEducation(nextEducation: SiteContent["education"]) {
    updateSite({ education: nextEducation });
  }

  function updateExperience(index: number, nextExperience: SiteContent["experiences"][number]) {
    const experiences = [...content.site.experiences];
    experiences[index] = nextExperience;
    updateSite({ experiences });
  }

  function moveExperience(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= content.site.experiences.length) return;
    const experiences = [...content.site.experiences];
    const moving = experiences[index];
    experiences[index] = experiences[nextIndex];
    experiences[nextIndex] = moving;
    updateSite({ experiences });
  }

  function updateProject(index: number, nextProject: Project) {
    setContent((current) => ({
      ...current,
      projects: current.projects.map((project, projectIndex) => (projectIndex === index ? nextProject : project)),
    }));
    if (index === selectedIndex) setProjectJson(JSON.stringify(nextProject, null, 2));
  }

  function updateSelectedProject(nextProject: Project) {
    updateProject(selectedIndex, nextProject);
  }

  function addProject() {
    const nextProject = createProject(content.projects.length + 1);
    setContent((current) => ({ ...current, projects: [...current.projects, nextProject] }));
    setSelectedIndex(content.projects.length);
    setUploadSectionIndex(0);
    setProjectJson(JSON.stringify(nextProject, null, 2));
  }

  function removeProject(index: number) {
    if (!confirm("确定要删除这个项目吗？")) return;
    const nextProjects = content.projects.filter((_, projectIndex) => projectIndex !== index);
    setContent((current) => ({ ...current, projects: nextProjects }));
    setSelectedIndex(0);
    setUploadSectionIndex(0);
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
    setUploadSectionIndex(0);
    setProjectJson(JSON.stringify(orderedProjects[nextIndex], null, 2));
  }

  function updateMetric(metricIndex: number, nextMetric: NonNullable<Project["metrics"]>[number]) {
    if (!selectedProject) return;
    const metrics = [...(selectedProject.metrics || [])];
    metrics[metricIndex] = nextMetric;
    updateSelectedProject({ ...selectedProject, metrics });
  }

  function addMetric() {
    if (!selectedProject) return;
    updateSelectedProject({
      ...selectedProject,
      metrics: [...(selectedProject.metrics || []), { value: "00", label: { zh: "指标说明", en: "Metric label" } }],
    });
  }

  function removeMetric(metricIndex: number) {
    if (!selectedProject) return;
    updateSelectedProject({
      ...selectedProject,
      metrics: (selectedProject.metrics || []).filter((_, index) => index !== metricIndex),
    });
  }

  function updateSection(sectionIndex: number, nextSection: ProjectSection) {
    if (!selectedProject) return;
    const sections = [...selectedProject.sections];
    sections[sectionIndex] = nextSection;
    updateSelectedProject({ ...selectedProject, sections });
  }

  function addSection() {
    if (!selectedProject) return;
    updateSelectedProject({ ...selectedProject, sections: [...selectedProject.sections, createSection()] });
    setUploadSectionIndex(selectedProject.sections.length);
  }

  function removeSection(sectionIndex: number) {
    if (!selectedProject) return;
    if (!confirm("确定要删除这个详情段落吗？")) return;
    const sections = selectedProject.sections.filter((_, index) => index !== sectionIndex);
    updateSelectedProject({ ...selectedProject, sections });
    setUploadSectionIndex(0);
  }

  function removeMedia(sectionIndex: number, mediaIndex: number) {
    if (!selectedProject) return;
    const section = selectedProject.sections[sectionIndex];
    updateSection(sectionIndex, {
      ...section,
      media: (section.media || []).filter((_, index) => index !== mediaIndex),
    });
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

  async function uploadToGithub(file: File): Promise<UploadedMedia | null> {
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
      return null;
    }

    const upload = (await uploadResponse.json()) as {
      fileUrl: string;
      mimeType?: string;
      originalFilename?: string;
    };
    const filename = upload.originalFilename || file.name;
    return {
      _type: file.type === "application/pdf" ? "file" : "image",
      url: upload.fileUrl,
      mimeType: upload.mimeType || file.type,
      originalFilename: filename,
      alt: { zh: filename, en: filename },
    };
  }

  async function uploadAboutPhoto(file: File) {
    const media = await uploadToGithub(file);
    if (!media) return;
    updateSite({ aboutPhoto: media });
    setState("idle");
    setMessage("个人照片已上传并加入关于我模块。等待 EdgeOne 重新部署后，前台会更新。");
  }

  async function uploadFile(file: File) {
    if (!selectedProject) return;
    const media = (await uploadToGithub(file)) as ProjectMedia | null;
    if (!media) return;

    const sections = selectedProject.sections.length ? [...selectedProject.sections] : [createSection()];
    const targetIndex = Math.min(uploadSectionIndex, sections.length - 1);
    sections[targetIndex] = {
      ...sections[targetIndex],
      media: [...(sections[targetIndex].media || []), media],
    };

    updateSelectedProject({ ...selectedProject, sections });
    setState("idle");
    setMessage("文件已提交到 GitHub，并已加入当前项目。等待 EdgeOne 重新部署后，前台会更新。");
  }

  async function saveContent() {
    const validationError = validateContent(content);
    if (validationError) {
      setState("error");
      setMessage(validationError);
      return;
    }

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

  function renderLocalized(
    title: string,
    value: LocalizedText,
    onChange: (nextValue: LocalizedText) => void,
    multiline = false,
  ) {
    return (
      <div className={multiline ? "admin-wide" : undefined}>
        <label>
          {title} 中文
          {multiline ? (
            <textarea value={value.zh} onChange={(event) => onChange({ ...value, zh: event.target.value })} />
          ) : (
            <input value={value.zh} onChange={(event) => onChange({ ...value, zh: event.target.value })} />
          )}
        </label>
        <label>
          {title} English
          {multiline ? (
            <textarea value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} />
          ) : (
            <input value={value.en} onChange={(event) => onChange({ ...value, en: event.target.value })} />
          )}
        </label>
      </div>
    );
  }

  function renderStyleControls(
    title: string,
    value: RichTextStyle | undefined,
    onChange: (nextValue: RichTextStyle) => void,
  ) {
    const current = styleValue(value);
    return (
      <div className="admin-style-controls">
        <strong>{title}</strong>
        <label>
          字号
          <select value={current.fontSize} onChange={(event) => onChange({ ...current, fontSize: event.target.value as RichTextStyle["fontSize"] })}>
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </label>
        <label>
          粗细
          <select value={current.fontWeight} onChange={(event) => onChange({ ...current, fontWeight: event.target.value as RichTextStyle["fontWeight"] })}>
            <option value="regular">常规</option>
            <option value="medium">中粗</option>
            <option value="bold">加粗</option>
          </select>
        </label>
      </div>
    );
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
          <div className="admin-subsection">
            <h3>首页模块管理</h3>
            <p className="admin-hint">可显示/隐藏模块，也可以调整上下顺序。隐藏后不会删除内容，随时可恢复。</p>
            {[...content.site.sections].sort((a, b) => a.order - b.order).map((section) => {
              const sectionIndex = content.site.sections.findIndex((item) => item.id === section.id);
              return (
              <div className="admin-module-row" key={section.id}>
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={section.visible}
                    onChange={(event) => updateHomeSection(sectionIndex, { ...section, visible: event.target.checked })}
                  />
                  显示
                </label>
                <strong>{section.label.zh || section.label.en}</strong>
                <button type="button" onClick={() => moveHomeSection(sectionIndex, -1)}>上移</button>
                <button type="button" onClick={() => moveHomeSection(sectionIndex, 1)}>下移</button>
              </div>
            );
            })}
          </div>
          {renderLocalized("职业定位", content.site.shortRole, (value) => updateSiteLocalized("shortRole", value))}
          {renderLocalized("所在地 / 服务范围", content.site.location, (value) => updateSiteLocalized("location", value))}
          <div className="admin-subsection">
            <h3>首页主视觉</h3>
            {renderLocalized("首页大标题第一行", content.site.heroTitle.line1, (value) =>
              updateSite({ heroTitle: { ...content.site.heroTitle, line1: value } }),
            )}
            {renderLocalized("首页大标题第二行", content.site.heroTitle.line2, (value) =>
              updateSite({ heroTitle: { ...content.site.heroTitle, line2: value } }),
            )}
            {renderLocalized("首页简介", content.site.intro, (value) => updateSiteLocalized("intro", value), true)}
            <label>
              首页编号 / 小字
              <input value={content.site.heroIndex} onChange={(event) => updateSite({ heroIndex: event.target.value })} />
            </label>
            {renderLocalized("滚动提示", content.site.scrollLabel, (value) => updateSiteLocalized("scrollLabel", value))}
          </div>

          <div className="admin-subsection">
            <h3>宣言区 / 作品区</h3>
            {renderLocalized("宣言小字", content.site.manifestoIntro, (value) => updateSiteLocalized("manifestoIntro", value))}
            {renderLocalized("宣言大字第一行", content.site.manifestoLine1, (value) => updateSiteLocalized("manifestoLine1", value))}
            {renderLocalized("宣言大字第二行", content.site.manifestoLine2, (value) => updateSiteLocalized("manifestoLine2", value))}
            {renderLocalized("作品区标题", content.site.workLabel, (value) => updateSiteLocalized("workLabel", value))}
            {renderLocalized("作品区说明", content.site.workIntro, (value) => updateSiteLocalized("workIntro", value), true)}
          </div>

          <div className="admin-subsection">
            <h3>关于我 / 联系</h3>
            {renderLocalized("关于我标签", content.site.aboutLabel, (value) => updateSiteLocalized("aboutLabel", value))}
            {renderLocalized("关于我大标题", content.site.aboutHeadline, (value) => updateSiteLocalized("aboutHeadline", value))}
            {renderLocalized("关于我正文", content.site.bio, (value) => updateSiteLocalized("bio", value), true)}
            {renderStyleControls("关于我正文字体", content.site.bioStyle, (value) => updateSite({ bioStyle: value }))}
            <div className="admin-upload">
              <label>
                关于我照片（显示在左侧）
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAboutPhoto(file);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              {content.site.aboutPhoto?.url ? (
                <div className="admin-photo-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={content.site.aboutPhoto.url} alt={content.site.aboutPhoto.originalFilename || "About photo"} />
                  <button type="button" className="danger" onClick={() => updateSite({ aboutPhoto: undefined })}>移除照片</button>
                </div>
              ) : null}
            </div>
            {renderLocalized("联系区标签", content.site.contactLabel, (value) => updateSiteLocalized("contactLabel", value))}
            {renderLocalized("联系区标题", content.site.contactHeadline, (value) => updateSiteLocalized("contactHeadline", value))}
          </div>

          <div className="admin-subsection">
            <div className="admin-panel-heading">
              <h3>学校信息</h3>
            </div>
            {renderLocalized("学校名称", content.site.education.school, (value) => updateEducation({ ...content.site.education, school: value }))}
            {renderLocalized("专业 / 学位", content.site.education.degree, (value) => updateEducation({ ...content.site.education, degree: value }))}
            {renderLocalized("时间", content.site.education.time, (value) => updateEducation({ ...content.site.education, time: value }))}
            {renderLocalized("学校简介", content.site.education.description, (value) => updateEducation({ ...content.site.education, description: value }), true)}
            {renderStyleControls("学校简介字体", content.site.education.style, (value) =>
              updateEducation({ ...content.site.education, style: value }),
            )}
            <label>
              学校链接（可选）
              <input value={content.site.education.link || ""} onChange={(event) => updateEducation({ ...content.site.education, link: event.target.value })} />
            </label>
          </div>

          <div className="admin-subsection">
            <div className="admin-panel-heading">
              <h3>工作经历</h3>
              <button type="button" onClick={() => updateSite({ experiences: [...content.site.experiences, createExperience()] })}>
                新增经历
              </button>
            </div>
            {content.site.experiences.map((experience, index) => (
              <div className="admin-repeat-item" key={`${experience.company.zh}-${index}`}>
                <div className="admin-panel-heading">
                  <h4>经历 {index + 1}</h4>
                  <div>
                    <button type="button" onClick={() => moveExperience(index, -1)}>上移</button>
                    <button type="button" onClick={() => moveExperience(index, 1)}>下移</button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => updateSite({ experiences: content.site.experiences.filter((_, itemIndex) => itemIndex !== index) })}
                    >
                      删除
                    </button>
                  </div>
                </div>
                {renderLocalized("公司名称", experience.company, (value) => updateExperience(index, { ...experience, company: value }))}
                {renderLocalized("职位", experience.position, (value) => updateExperience(index, { ...experience, position: value }))}
                {renderLocalized("时间", experience.time, (value) => updateExperience(index, { ...experience, time: value }))}
                {renderLocalized("简介", experience.description, (value) => updateExperience(index, { ...experience, description: value }), true)}
                {renderStyleControls("简介字体", experience.style, (value) => updateExperience(index, { ...experience, style: value }))}
                <label>
                  项目链接（可选）
                  <input value={experience.link || ""} onChange={(event) => updateExperience(index, { ...experience, link: event.target.value })} />
                </label>
              </div>
            ))}
          </div>

          <div className="admin-subsection">
            <div className="admin-panel-heading">
              <h3>社交链接</h3>
              <button
                type="button"
                onClick={() => updateSite({ social: [...content.site.social, { label: "Link", href: "https://" }] })}
              >
                新增
              </button>
            </div>
            {content.site.social.map((item, index) => (
              <div className="admin-repeat-item" key={`${item.label}-${index}`}>
                <label>
                  名称
                  <input
                    value={item.label}
                    onChange={(event) => {
                      const social = [...content.site.social];
                      social[index] = { ...item, label: event.target.value };
                      updateSite({ social });
                    }}
                  />
                </label>
                <label>
                  链接
                  <input
                    value={item.href}
                    onChange={(event) => {
                      const social = [...content.site.social];
                      social[index] = { ...item, href: event.target.value };
                      updateSite({ social });
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="danger"
                  onClick={() => updateSite({ social: content.site.social.filter((_, itemIndex) => itemIndex !== index) })}
                >
                  删除链接
                </button>
              </div>
            ))}
          </div>
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
                  setUploadSectionIndex(0);
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
                  onChange={(event) => updateSelectedProject({ ...selectedProject, slug: slugify(event.target.value) })}
                />
              </label>
              <label>
                年份
                <input
                  value={selectedProject.year}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, year: event.target.value })}
                />
              </label>
              <label>
                主题色
                <input
                  type="color"
                  value={selectedProject.accent}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, accent: event.target.value })}
                />
              </label>
              <label>
                外部链接（可空）
                <input
                  value={selectedProject.externalUrl || ""}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, externalUrl: event.target.value })}
                />
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(selectedProject.featured)}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, featured: event.target.checked })}
                />
                是否精选
              </label>
              {renderLocalized("状态", localizedValue(selectedProject.status), (value) =>
                updateSelectedProject({ ...selectedProject, status: value }),
              )}
              {renderLocalized("项目标题", selectedProject.title, (value) =>
                updateSelectedProject({ ...selectedProject, title: value }),
              )}
              {renderLocalized("项目摘要", selectedProject.summary, (value) =>
                updateSelectedProject({ ...selectedProject, summary: value }),
                true,
              )}
              {renderLocalized("角色", selectedProject.role, (value) =>
                updateSelectedProject({ ...selectedProject, role: value }),
              )}
              {renderLocalized("分类", selectedProject.category, (value) =>
                updateSelectedProject({ ...selectedProject, category: value }),
              )}
            </div>

            <div className="admin-subsection">
              <div className="admin-panel-heading">
                <h3>项目指标</h3>
                <button type="button" onClick={addMetric}>新增指标</button>
              </div>
              {(selectedProject.metrics || []).map((metric, index) => (
                <div className="admin-repeat-item" key={`${metric.value}-${index}`}>
                  <label>
                    指标数值
                    <input value={metric.value} onChange={(event) => updateMetric(index, { ...metric, value: event.target.value })} />
                  </label>
                  {renderLocalized("指标说明", metric.label, (value) => updateMetric(index, { ...metric, label: value }))}
                  <button type="button" className="danger" onClick={() => removeMetric(index)}>删除指标</button>
                </div>
              ))}
            </div>

            <div className="admin-subsection">
              <div className="admin-panel-heading">
                <h3>项目详情段落</h3>
                <button type="button" onClick={addSection}>新增段落</button>
              </div>
              {selectedProject.sections.map((section, sectionIndex) => (
                <div className="admin-section-card" key={`${section.title.en}-${sectionIndex}`}>
                  <div className="admin-panel-heading">
                    <h4>段落 {sectionIndex + 1}</h4>
                    <button type="button" className="danger" onClick={() => removeSection(sectionIndex)}>删除段落</button>
                  </div>
                  <label>
                    背景色
                    <select
                      value={section.tone || "light"}
                      onChange={(event) => updateSection(sectionIndex, { ...section, tone: event.target.value as Tone })}
                    >
                      <option value="light">浅色</option>
                      <option value="dark">深色</option>
                      <option value="blue">蓝色</option>
                      <option value="lime">绿色</option>
                    </select>
                  </label>
                  {renderLocalized("段落眉题", section.eyebrow, (value) => updateSection(sectionIndex, { ...section, eyebrow: value }))}
                  {renderLocalized("段落标题", section.title, (value) => updateSection(sectionIndex, { ...section, title: value }))}
                  {renderLocalized("段落正文", section.body, (value) => updateSection(sectionIndex, { ...section, body: value }), true)}
                  {renderStyleControls("段落正文字体", section.bodyStyle, (value) => updateSection(sectionIndex, { ...section, bodyStyle: value }))}
                  {section.media?.length ? (
                    <div className="admin-media-list">
                      {section.media.map((media, mediaIndex) => (
                        <div key={`${media.url}-${mediaIndex}`}>
                          <span>{media.mimeType || media._type}</span>
                          <a href={media.url} target="_blank" rel="noreferrer">{media.originalFilename || media.url}</a>
                          <button type="button" className="danger" onClick={() => removeMedia(sectionIndex, mediaIndex)}>移除</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="admin-upload">
              <label>
                上传到哪个详情段落
                <select value={uploadSectionIndex} onChange={(event) => setUploadSectionIndex(Number(event.target.value))}>
                  {selectedProject.sections.map((section, index) => (
                    <option key={`${section.title.en}-${index}`} value={index}>
                      段落 {index + 1}：{section.title.zh || section.title.en}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                上传 PNG / JPG / GIF / WEBP / PDF / MP4
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

            <details className="admin-json">
              <summary>高级：项目完整内容 JSON</summary>
              <textarea value={projectJson} onChange={(event) => setProjectJson(event.target.value)} />
              <button className="secondary" onClick={applyProjectJson}>应用 JSON 到当前项目</button>
            </details>
          </section>
        ) : null}
      </section>
    </main>
  );
}
