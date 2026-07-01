"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeSection, LocalizedText, Project, RichTextStyle, SiteContent, UploadedMedia } from "@/content/types";
import type { PortfolioContent } from "@/lib/portfolio-data";
import { useAssetPath } from "@/lib/use-asset-path";

type SaveState = "idle" | "loading" | "saving" | "saved" | "error";
type ProjectSection = Project["sections"][number];
type ProjectMedia = NonNullable<ProjectSection["media"]>[number];
type Tone = NonNullable<ProjectSection["tone"]>;
type Align = "left" | "center" | "right";
type UploadTarget = "about" | "project";
type UploadState = {
  active: boolean;
  fileName: string;
  percent: number;
  phase: string;
  target?: UploadTarget;
  error?: string;
  success?: string;
};
type UploadResponse = {
  fileUrl?: string;
  mimeType?: string;
  originalFilename?: string;
  detail?: string;
  message?: string;
};

const MAX_ABOUT_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_PROJECT_UPLOAD_BYTES = 20 * 1024 * 1024;
const ABOUT_PHOTO_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
const PROJECT_UPLOAD_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "application/pdf", "video/mp4"]);
const DRAFT_STORAGE_KEY = "portfolio-2026-admin-draft";

const emptyLocalized: LocalizedText = { zh: "", en: "" };

const emptySite: SiteContent = {
  name: "",
  heroStyle: "cinematic",
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
  aboutHeadlineStyle: { fontSize: "large", fontWeight: "bold" },
  education: {
    school: emptyLocalized,
    degree: emptyLocalized,
    time: emptyLocalized,
    description: emptyLocalized,
    link: "",
    style: { fontSize: "small", fontWeight: "regular" },
    titleStyle: { fontSize: "large", fontWeight: "bold" },
  },
  education2: {
    school: emptyLocalized,
    degree: emptyLocalized,
    time: emptyLocalized,
    description: emptyLocalized,
    link: "",
    style: { fontSize: "small", fontWeight: "regular" },
    titleStyle: { fontSize: "medium", fontWeight: "bold" },
  },
  experiences: [],
  contactLabel: emptyLocalized,
  contactHeadline: emptyLocalized,
  email: "",
  phone: "",
  social: [],
};

function createSection(): ProjectSection {
  return {
    eyebrow: { zh: "背景", en: "Context" },
    title: { zh: "项目标题", en: "Project title" },
    body: { zh: "这里写项目详情。", en: "Write project details here." },
    titleStyle: { fontSize: "large", fontWeight: "bold" },
    titleAlign: "left",
    bodyStyle: { fontSize: "medium", fontWeight: "regular" },
    bodyAlign: "left",
    tableAlign: "left",
    mediaLayout: "square-gallery",
    splitPattern: "abab",
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
    titleStyle: { fontSize: "medium", fontWeight: "bold" } as RichTextStyle,
    modalTitleStyle: { fontSize: "medium", fontWeight: "bold" } as RichTextStyle,
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

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.ceil(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function validateUploadFile(file: File, target: UploadTarget) {
  const allowedTypes = target === "about" ? ABOUT_PHOTO_TYPES : PROJECT_UPLOAD_TYPES;
  const maxBytes = target === "about" ? MAX_ABOUT_PHOTO_BYTES : MAX_PROJECT_UPLOAD_BYTES;
  const readableTypes = target === "about" ? "PNG / JPG / GIF / WEBP" : "PNG / JPG / GIF / WEBP / PDF / MP4";

  if (!allowedTypes.has(file.type)) {
    return `文件格式不支持。请上传 ${readableTypes}${file.type ? `，当前文件类型是 ${file.type}` : ""}。`;
  }

  if (file.size > maxBytes) {
    return `文件太大：${formatBytes(file.size)}。当前${target === "about" ? "照片" : "作品素材"}单个文件限制为 ${formatBytes(maxBytes)}，请压缩后再上传。`;
  }

  return "";
}

function buildUploadedMedia(file: File, upload: { fileUrl: string; mimeType?: string; originalFilename?: string }): UploadedMedia {
  const filename = upload.originalFilename || file.name;
  return {
    _type: file.type === "application/pdf" ? "file" : "image",
    url: upload.fileUrl,
    mimeType: upload.mimeType || file.type,
    originalFilename: filename,
    title: { zh: filename.replace(/\.[^.]+$/, ""), en: filename.replace(/\.[^.]+$/, "") },
    alt: { zh: filename, en: filename },
    caption: { zh: "", en: "" },
    layout: "auto",
    textPosition: "right",
  };
}

export function AdminPage() {
  const resolveAssetPath = useAssetPath();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>({ site: emptySite, projects: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [uploadSectionIndex, setUploadSectionIndex] = useState(0);
  const [projectJson, setProjectJson] = useState("");
  const [state, setState] = useState<SaveState>("loading");
  const [message, setMessage] = useState("正在检查登录状态…");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [translationState, setTranslationState] = useState<"idle" | "translating" | "error">("idle");
  const translationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationAbortRef = useRef<AbortController | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    active: false,
    fileName: "",
    percent: 0,
    phase: "",
  });

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

  useEffect(() => {
    return () => {
      if (translationTimerRef.current) clearTimeout(translationTimerRef.current);
      translationAbortRef.current?.abort();
    };
  }, []);

  function cancelPendingTranslation() {
    if (translationTimerRef.current) {
      clearTimeout(translationTimerRef.current);
      translationTimerRef.current = null;
    }
    translationAbortRef.current?.abort();
    translationAbortRef.current = null;
    setTranslationState("idle");
  }

  function scheduleTranslation(source: string, applyTranslation: (translated: string) => void) {
    cancelPendingTranslation();

    if (!autoTranslate) return;
    if (!source.trim()) {
      applyTranslation("");
      return;
    }

    translationTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      translationAbortRef.current = controller;
      setTranslationState("translating");

      try {
        const response = await fetch("/api/admin/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: source }),
          signal: controller.signal,
        });
        const result = (await response.json().catch(() => null)) as { translation?: string; message?: string } | null;
        if (!response.ok || typeof result?.translation !== "string") {
          throw new Error(result?.message || "翻译服务暂时不可用");
        }
        applyTranslation(result.translation);
        setTranslationState("idle");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setTranslationState("error");
      } finally {
        if (translationAbortRef.current === controller) translationAbortRef.current = null;
      }
    }, 700);
  }

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
    let restoredDraft: PortfolioContent | null = null;
    try {
      const storedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      restoredDraft = storedDraft ? (JSON.parse(storedDraft) as PortfolioContent) : null;
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    const sourceContent = restoredDraft || nextContent;
    const sortedContent = { ...sourceContent, projects: sortProjects(sourceContent.projects) };
    setContent(sortedContent);
    setSelectedIndex(0);
    setUploadSectionIndex(0);
    setProjectJson(sortedContent.projects[0] ? JSON.stringify(sortedContent.projects[0], null, 2) : "");
    setState("idle");
    setMessage(restoredDraft ? "已恢复未发布草稿。确认完成后点击“保存发布”统一上线。" : "内容已加载，可以开始编辑。");
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

  function updateEducation2(nextEducation: SiteContent["education2"]) {
    updateSite({ education2: nextEducation });
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

  function updateMedia(sectionIndex: number, mediaIndex: number, nextMedia: ProjectMedia) {
    if (!selectedProject) return;
    const section = selectedProject.sections[sectionIndex];
    const media = [...(section.media || [])];
    media[mediaIndex] = nextMedia;
    updateSection(sectionIndex, { ...section, media });
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

  async function uploadToGithub(file: File, target: UploadTarget): Promise<UploadedMedia | null> {
    const validationError = validateUploadFile(file, target);
    if (validationError) {
      setState("error");
      setMessage(validationError);
      setUploadState({
        active: false,
        fileName: file.name,
        percent: 0,
        phase: "上传未开始",
        target,
        error: validationError,
      });
      return null;
    }

    setState("saving");
    setMessage(`正在上传 ${file.name}…`);
    setUploadState({
      active: true,
      fileName: file.name,
      percent: 2,
      phase: "正在准备文件…",
      target,
    });

    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload");
      xhr.timeout = 180000;

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          setUploadState((current) => ({ ...current, percent: Math.max(current.percent, 35), phase: "正在上传到服务器…" }));
          return;
        }

        const uploadPercent = Math.min(78, Math.max(5, Math.round((event.loaded / event.total) * 78)));
        setUploadState((current) => ({
          ...current,
          percent: uploadPercent,
          phase: uploadPercent >= 78 ? "正在提交到 GitHub…" : "正在上传到服务器…",
        }));
      };

      xhr.onload = () => {
        let result: UploadResponse | null = null;
        try {
          result = JSON.parse(xhr.responseText || "null") as UploadResponse | null;
        } catch {
          result = null;
        }

        if (xhr.status < 200 || xhr.status >= 300 || !result?.fileUrl) {
          const errorMessage = result?.detail || result?.message || `上传失败，服务器返回 ${xhr.status || "未知状态"}。`;
          setState("error");
          setMessage(`上传失败：${errorMessage}`);
          setUploadState({
            active: false,
            fileName: file.name,
            percent: 0,
            phase: "上传失败",
            target,
            error: errorMessage,
          });
          resolve(null);
          return;
        }

        setUploadState({
          active: false,
          fileName: file.name,
          percent: 100,
          phase: "上传完成，已加入当前表单",
          target,
          success: "上传成功。请继续点击“保存发布”，把这个素材写入网站内容。",
        });
        resolve(buildUploadedMedia(file, result as { fileUrl: string; mimeType?: string; originalFilename?: string }));
      };

      xhr.onerror = () => {
        const errorMessage = "网络中断，上传没有完成。请重新选择文件再试。";
        setState("error");
        setMessage(`上传失败：${errorMessage}`);
        setUploadState({
          active: false,
          fileName: file.name,
          percent: 0,
          phase: "上传失败",
          target,
          error: errorMessage,
        });
        resolve(null);
      };

      xhr.ontimeout = () => {
        const errorMessage = "上传超时。文件可能太大，建议压缩后再上传。";
        setState("error");
        setMessage(`上传失败：${errorMessage}`);
        setUploadState({
          active: false,
          fileName: file.name,
          percent: 0,
          phase: "上传超时",
          target,
          error: errorMessage,
        });
        resolve(null);
      };

      setUploadState((current) => ({ ...current, percent: 5, phase: "正在上传到服务器…" }));
      xhr.send(formData);
    });
  }

  async function uploadAboutPhoto(file: File) {
    const media = await uploadToGithub(file, "about");
    if (!media) return;
    updateSite({ aboutPhoto: media });
    setState("idle");
    setMessage("个人照片已上传并加入关于我模块。请点击“保存发布”，前台才会正式更新。");
  }

  async function uploadFile(file: File) {
    if (!selectedProject) return;
    const media = (await uploadToGithub(file, "project")) as ProjectMedia | null;
    if (!media) return;

    const sections = selectedProject.sections.length ? [...selectedProject.sections] : [createSection()];
    const targetIndex = Math.min(uploadSectionIndex, sections.length - 1);
    sections[targetIndex] = {
      ...sections[targetIndex],
      media: [...(sections[targetIndex].media || []), media],
    };

    updateSelectedProject({ ...selectedProject, sections });
    setState("idle");
    setMessage("文件已上传并加入当前项目。请点击“保存发布”，前台才会正式更新。");
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
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setMessage(saved.message || "已提交到 GitHub。等待 EdgeOne 自动重新部署后，前台会更新。");
  }

  function saveDraft() {
    const validationError = validateContent(content);
    if (validationError) {
      setState("error");
      setMessage(validationError);
      return;
    }

    try {
      const draft = {
        ...content,
        projects: content.projects.map((project, index) => ({ ...project, order: index + 1 })),
      };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setState("saved");
      setMessage("草稿已仅保存在当前浏览器，尚未发布到前台。可继续编辑，完成后再统一发布。");
    } catch {
      setState("error");
      setMessage("草稿保存失败，可能是浏览器存储空间不足。请尝试删除旧缓存后重试。");
    }
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
    const updateChinese = (nextChinese: string) => {
      const nextValue = { ...value, zh: nextChinese };
      onChange(nextValue);
      scheduleTranslation(nextChinese, (translated) => onChange({ ...nextValue, en: translated }));
    };

    const updateEnglish = (nextEnglish: string) => {
      cancelPendingTranslation();
      onChange({ ...value, en: nextEnglish });
    };

    return (
      <div className={multiline ? "admin-wide" : undefined}>
        <label>
          {title} 中文
          {multiline ? (
            <textarea value={value.zh} onChange={(event) => updateChinese(event.target.value)} />
          ) : (
            <input value={value.zh} onChange={(event) => updateChinese(event.target.value)} />
          )}
        </label>
        <label>
          {title} English
          {multiline ? (
            <textarea value={value.en} onChange={(event) => updateEnglish(event.target.value)} />
          ) : (
            <input value={value.en} onChange={(event) => updateEnglish(event.target.value)} />
          )}
        </label>
      </div>
    );
  }

  function renderMediaPreview(media: ProjectMedia) {
    const mimeType = media.mimeType || "";
    const source = media.url.toLowerCase();
    const isImage = mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(source);
    const isVideo = mimeType.startsWith("video/") || /\.(mp4|webm|mov)(\?|$)/i.test(source);
    const isPdf = mimeType === "application/pdf" || /\.pdf(\?|$)/i.test(source);

    return (
      <a className="admin-media-preview" href={resolveAssetPath(media.url)} target="_blank" rel="noreferrer" title="点击查看原文件">
        {isImage ? <img src={resolveAssetPath(media.url)} alt={media.originalFilename || media.alt?.zh || "上传图片预览"} loading="lazy" /> : null}
        {isVideo ? <video src={resolveAssetPath(media.url)} muted playsInline preload="metadata" /> : null}
        {isPdf ? <iframe src={`${resolveAssetPath(media.url)}#page=1&view=FitH`} title={`${media.originalFilename || "PDF"} 预览`} loading="lazy" /> : null}
        {!isImage && !isVideo && !isPdf ? <span className="admin-file-placeholder">FILE</span> : null}
      </a>
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

  function renderAlignControls(title: string, value: Align | undefined, onChange: (nextValue: Align) => void) {
    return (
      <label>
        {title}
        <select value={value || "left"} onChange={(event) => onChange(event.target.value as Align)}>
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
        </select>
      </label>
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
          <label className="admin-translate-toggle">
            <input
              type="checkbox"
              checked={autoTranslate}
              onChange={(event) => {
                setAutoTranslate(event.target.checked);
                if (!event.target.checked) cancelPendingTranslation();
              }}
            />
            中文自动翻译
            {translationState === "translating" ? <span>翻译中…</span> : null}
            {translationState === "error" ? <span className="is-error">翻译失败，可手动填写</span> : null}
          </label>
          <a href="/" target="_blank">打开前台</a>
          <button className="secondary" onClick={checkGithub} disabled={state === "saving" || state === "loading"}>
            检测 GitHub
          </button>
          <button className="secondary" onClick={saveDraft} disabled={state === "saving" || state === "loading"}>仅保存草稿</button>
          <button onClick={saveContent} disabled={state === "saving" || state === "loading"}>保存发布</button>
        </div>
      </header>

      <p className={`admin-message admin-message-${state}`}>{message}</p>
      {uploadState.fileName ? (
        <div className={`admin-upload-status ${uploadState.error ? "is-error" : ""} ${uploadState.success ? "is-success" : ""}`}>
          <div className="admin-upload-status-row">
            <strong>{uploadState.fileName}</strong>
            <div className="admin-upload-status-actions">
              <span>{uploadState.percent}%</span>
              {uploadState.success ? (
                <button
                  type="button"
                  className="admin-upload-dismiss"
                  aria-label="清除已完成的上传提示"
                  title="清除上传提示"
                  onClick={() => setUploadState({ active: false, fileName: "", percent: 0, phase: "" })}
                >
                  ×
                </button>
              ) : null}
            </div>
          </div>
          <div className="admin-progress" aria-label="上传进度">
            <span style={{ width: `${uploadState.percent}%` }} />
          </div>
          <p>{uploadState.error || uploadState.success || uploadState.phase}</p>
        </div>
      ) : null}

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
            手机号（联系模块展示）
            <input value={content.site.phone || ""} onChange={(event) => updateSite({ phone: event.target.value })} placeholder="例如：138 0000 0000" />
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
            <label>
              首页主视觉主题
              <select
                value={content.site.heroStyle || "cinematic"}
                onChange={(event) => updateSite({ heroStyle: event.target.value as SiteContent["heroStyle"] })}
              >
                <option value="cinematic">开花动态效果（当前默认）</option>
                <option value="original">原来的 3D 动态形状</option>
              </select>
            </label>
            <p className="admin-hint">这个选择同时应用于浅色和深色模式；两套效果都保留，保存发布后即可切换。</p>
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
            {renderStyleControls("关于我大标题字体", content.site.aboutHeadlineStyle, (value) => updateSite({ aboutHeadlineStyle: value }))}
            {renderLocalized("关于我正文", content.site.bio, (value) => updateSiteLocalized("bio", value), true)}
            {renderStyleControls("关于我正文字体", content.site.bioStyle, (value) => updateSite({ bioStyle: value }))}
            <div className="admin-upload">
              <label>
                关于我照片（显示在左侧，PNG/JPG/GIF/WEBP，≤ {formatBytes(MAX_ABOUT_PHOTO_BYTES)}）
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  disabled={uploadState.active}
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
                  <img src={resolveAssetPath(content.site.aboutPhoto.url)} alt={content.site.aboutPhoto.originalFilename || "About photo"} />
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
            <h4>第一学历</h4>
            {renderLocalized("学校名称", content.site.education.school, (value) => updateEducation({ ...content.site.education, school: value }))}
            {renderStyleControls("第一学历学校名字体", content.site.education.titleStyle, (value) =>
              updateEducation({ ...content.site.education, titleStyle: value }),
            )}
            {renderLocalized("专业 / 学位", content.site.education.degree, (value) => updateEducation({ ...content.site.education, degree: value }))}
            {renderLocalized("时间", content.site.education.time, (value) => updateEducation({ ...content.site.education, time: value }))}
            <label>
              学校链接（可选）
              <input value={content.site.education.link || ""} onChange={(event) => updateEducation({ ...content.site.education, link: event.target.value })} />
            </label>
            <h4>第二学历</h4>
            {renderLocalized("学校名称", content.site.education2?.school || emptyLocalized, (value) =>
              updateEducation2({ ...(content.site.education2 || emptySite.education2!), school: value }),
            )}
            {renderStyleControls("第二学历学校名字体", content.site.education2?.titleStyle, (value) =>
              updateEducation2({ ...(content.site.education2 || emptySite.education2!), titleStyle: value }),
            )}
            {renderLocalized("专业 / 学位", content.site.education2?.degree || emptyLocalized, (value) =>
              updateEducation2({ ...(content.site.education2 || emptySite.education2!), degree: value }),
            )}
            {renderLocalized("时间", content.site.education2?.time || emptyLocalized, (value) =>
              updateEducation2({ ...(content.site.education2 || emptySite.education2!), time: value }),
            )}
            <label>
              学校链接（可选）
              <input
                value={content.site.education2?.link || ""}
                onChange={(event) => updateEducation2({ ...(content.site.education2 || emptySite.education2!), link: event.target.value })}
              />
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
                {renderStyleControls("公司列表名字体", experience.titleStyle, (value) =>
                  updateExperience(index, { ...experience, titleStyle: value }),
                )}
                {renderLocalized("职位", experience.position, (value) => updateExperience(index, { ...experience, position: value }))}
                {renderLocalized("时间", experience.time, (value) => updateExperience(index, { ...experience, time: value }))}
                {renderLocalized("简介", experience.description, (value) => updateExperience(index, { ...experience, description: value }), true)}
                {renderStyleControls("弹框公司名字体", experience.modalTitleStyle, (value) =>
                  updateExperience(index, { ...experience, modalTitleStyle: value }),
                )}
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
                <small>{[project.year, project.slug].filter(Boolean).join(" · ") || "未填写辅助信息"}</small>
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
                页面地址 Slug（内部链接用，不是外部链接）
                <input
                  value={selectedProject.slug}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, slug: slugify(event.target.value) })}
                  placeholder="例如 ai-project"
                />
              </label>
              <label>
                年份（选填）
                <input
                  value={selectedProject.year}
                  onChange={(event) => updateSelectedProject({ ...selectedProject, year: event.target.value })}
                  placeholder="例如 2026，可留空"
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
                  {renderStyleControls("段落标题字体", section.titleStyle, (value) => updateSection(sectionIndex, { ...section, titleStyle: value }))}
                  {renderAlignControls("段落标题对齐", section.titleAlign, (value) => updateSection(sectionIndex, { ...section, titleAlign: value }))}
                  {renderLocalized("段落正文", section.body, (value) => updateSection(sectionIndex, { ...section, body: value }), true)}
                  {renderStyleControls("段落正文字体", section.bodyStyle, (value) => updateSection(sectionIndex, { ...section, bodyStyle: value }))}
                  {renderAlignControls("段落正文对齐", section.bodyAlign, (value) => updateSection(sectionIndex, { ...section, bodyAlign: value }))}
                  {renderAlignControls("表格内容对齐", section.tableAlign, (value) => updateSection(sectionIndex, { ...section, tableAlign: value }))}
                  <label>
                    媒体展示方式
                    <select
                      value={section.mediaLayout || "auto"}
                      onChange={(event) => updateSection(sectionIndex, { ...section, mediaLayout: event.target.value as ProjectSection["mediaLayout"] })}
                    >
                      <option value="auto">自动判断</option>
                      <option value="square-gallery">作品画廊：一排 4 个正方形，点击弹框</option>
                      <option value="portrait-grid">竖版图：一排 4 个，可点击放大</option>
                      <option value="landscape-split">横版图：图文左右布局</option>
                      <option value="full">通栏大图 / PDF 预览</option>
                    </select>
                  </label>
                  <label>
                    横版图文排版
                    <select
                      value={section.splitPattern || "abab"}
                      onChange={(event) => updateSection(sectionIndex, { ...section, splitPattern: event.target.value as ProjectSection["splitPattern"] })}
                    >
                      <option value="abab">ABAB 交替</option>
                      <option value="image-left">图片始终在左</option>
                      <option value="image-right">图片始终在右</option>
                    </select>
                  </label>
                  {section.media?.length ? (
                    <div className="admin-media-list">
                      {section.media.map((media, mediaIndex) => (
                        <div key={`${media.url}-${mediaIndex}`}>
                          {renderMediaPreview(media)}
                          <span>{media.mimeType || media._type}</span>
                          <a href={resolveAssetPath(media.url)} target="_blank" rel="noreferrer">{media.originalFilename || media.url}</a>
                          {renderLocalized("作品标题", localizedValue(media.title), (value) =>
                            updateMedia(sectionIndex, mediaIndex, { ...media, title: value }),
                          )}
                          <label>
                            单个素材展示
                            <select
                              value={media.layout || "auto"}
                              onChange={(event) => updateMedia(sectionIndex, mediaIndex, { ...media, layout: event.target.value as ProjectMedia["layout"] })}
                            >
                              <option value="auto">跟随段落设置</option>
                              <option value="portrait-grid">竖版四宫格</option>
                              <option value="landscape-split">横版图文</option>
                              <option value="full">通栏 / PDF</option>
                            </select>
                          </label>
                          <label>
                            图文位置
                            <select
                              value={media.textPosition || "right"}
                              onChange={(event) => updateMedia(sectionIndex, mediaIndex, { ...media, textPosition: event.target.value as ProjectMedia["textPosition"] })}
                            >
                              <option value="right">图片左，文字右</option>
                              <option value="left">文字左，图片右</option>
                            </select>
                          </label>
                          {renderLocalized("弹框说明文案", localizedValue(media.caption), (value) =>
                            updateMedia(sectionIndex, mediaIndex, { ...media, caption: value }),
                            true,
                          )}
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
                上传 PNG / JPG / GIF / WEBP / PDF / MP4（单个文件 ≤ {formatBytes(MAX_PROJECT_UPLOAD_BYTES)}）
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,video/mp4"
                  disabled={uploadState.active}
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
