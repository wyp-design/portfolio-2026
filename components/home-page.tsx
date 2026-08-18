"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { ResilientImage } from "@/components/resilient-image";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";

type HomePageProps = { projects: Project[]; site: SiteContent };

const copy = {
  zh: {
    available: "\u53ef\u63a5\u53d7\u65b0\u7684\u5408\u4f5c",
    heroA: "\u8bbe\u8ba1\u8ba9\u590d\u6742",
    heroB: "\u53d8\u5f97\u6e05\u6670",
    heroNote: "\u4e0d\u53ea\u5173\u6ce8\u89c6\u89c9\uff0c\u4e5f\u8ba9\u6570\u5b57\u4f53\u9a8c\u6e05\u6670\u3001\u53ef\u4fe1\u3001\u771f\u6b63\u597d\u7528\u3002",
    about: "\u5173\u4e8e\u6211",
    aboutTitle: "\u6211\u505a\u8ba9\u4eba\u8bb0\u5f97\u4f4f\u7684\u8bbe\u8ba1",
    projects: "\u4f5c\u54c1\u96c6",
    projectsTitle: "\u4f1a\u8bb2\u6545\u4e8b\u7684\u9879\u76ee",
    services: "\u80fd\u529b",
    servicesTitle: "\u6211\u53ef\u4ee5\u4e3a\u4f60\u505a\u4ec0\u4e48",
    reviews: "\u5408\u4f5c",
    reviewsTitle: "\u50cf\u7d20\u80cc\u540e\u7684\u5408\u4f5c\u4f53\u9a8c",
    faq: "\u5e38\u89c1\u95ee\u9898",
    faqTitle: "\u5f00\u59cb\u4e4b\u524d\uff0c\u4f60\u53ef\u80fd\u60f3\u77e5\u9053",
    education: "\u6559\u80b2\u7ecf\u5386",
    experience: "\u5de5\u4f5c\u7ecf\u5386",
    profileSummary: "\u4e2a\u4eba\u7b80\u4ecb",
    capabilities: "\u80fd\u529b\u4e0e\u5de5\u5177",
    swipeHint: "\u5de6\u53f3\u6ed1\u52a8\u67e5\u770b",
    previousCard: "\u4e0a\u4e00\u5f20\u5361\u7247",
    nextCard: "\u4e0b\u4e00\u5f20\u5361\u7247",
    contact: "\u8054\u7cfb\u6211",
    contactTitle: "\u4e00\u8d77\u505a\u70b9\u503c\u5f97\u8bb0\u4f4f\u7684\u4e1c\u897f",
    view: "\u67e5\u770b\u9879\u76ee",
    start: "\u5f00\u59cb\u5408\u4f5c",
  },
  en: {
    available: "Available for new work",
    heroA: "Design makes",
    heroB: "complexity clear",
    heroNote: "Not just visuals. I make digital experiences clear, trusted and genuinely useful.",
    about: "About",
    aboutTitle: "I make designs people remember",
    projects: "Projects",
    projectsTitle: "Projects that tell stories",
    services: "Services",
    servicesTitle: "Where I can help you",
    reviews: "Reviews",
    reviewsTitle: "Collaboration behind the pixels",
    faq: "FAQs",
    faqTitle: "Answers before we begin",
    education: "Education",
    experience: "Experience",
    profileSummary: "Profile",
    capabilities: "Capabilities & tools",
    swipeHint: "Swipe to explore",
    previousCard: "Previous card",
    nextCard: "Next card",
    contact: "Contact",
    contactTitle: "Let's build something memorable",
    view: "View project",
    start: "Start a project",
  },
};

const serviceRows = [
  ["Website Design", "UI / UX"],
  ["Product Experience", "Apps / Systems"],
  ["Brand Identity", "Visual Language"],
  ["AI Exploration", "Creative Workflow"],
];

function firstMedia(project: Project): UploadedMedia | undefined {
  return project.sections.flatMap((section) => section.media ?? []).find((media) => media.url);
}

function richStyleClass(style: { fontSize?: string; fontWeight?: string } | undefined) {
  return [style?.fontSize ? `rich-size-${style.fontSize}` : "", style?.fontWeight ? `rich-weight-${style.fontWeight}` : ""]
    .filter(Boolean)
    .join(" ");
}

function boundedNumber(value: number | undefined, fallback: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? Number(value) : fallback));
}

function CursorEyes() {
  const ref = useRef<HTMLDivElement>(null);
  const pupils = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const node = ref.current;
    if (!node) return;
    let targetX = -120;
    let targetY = -120;
    let currentX = -120;
    let currentY = -120;
    let frame = 0;
    const heroEyes = document.querySelector<HTMLElement>(".creatie-eyes-static");

    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      node.dataset.visible = "true";
      const dx = event.movementX;
      const dy = event.movementY;
      const length = Math.max(1, Math.hypot(dx, dy));
      pupils.current.forEach((pupil) => {
        if (pupil) pupil.style.transform = `translate(${(dx / length) * 3}px, ${(dy / length) * 3}px)`;
      });
      if (heroEyes) {
        const bounds = heroEyes.getBoundingClientRect();
        const lookX = Math.max(-5, Math.min(5, (event.clientX - (bounds.left + bounds.width / 2)) / 55));
        const lookY = Math.max(-6, Math.min(6, (event.clientY - (bounds.top + bounds.height / 2)) / 55));
        heroEyes.style.setProperty("--look-x", `${lookX}px`);
        heroEyes.style.setProperty("--look-y", `${lookY}px`);
      }
      node.dataset.engaged = event.target instanceof Element && Boolean(event.target.closest("a, button, summary")) ? "true" : "false";
    };
    const press = () => { node.dataset.pressed = "true"; };
    const release = () => { node.dataset.pressed = "false"; };
    const leave = () => {
      node.dataset.visible = "false";
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.34;
      currentY += (targetY - currentY) * 0.34;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className="creatie-cursor-eyes" aria-hidden="true">
      {[0, 1].map((index) => (
        <span className="creatie-cursor-eye" key={index}>
          <span ref={(node) => { pupils.current[index] = node; }} className="creatie-cursor-pupil" />
        </span>
      ))}
    </div>
  );
}

function Dock() {
  return (
    <nav className="creatie-dock" aria-label="Page navigation">
      <a className="creatie-dock-app app-notes" href="#about" aria-label="About" data-label="About">
        <ResilientImage src="/icons/mac/notes.svg" alt="" aria-hidden="true" />
      </a>
      <a className="creatie-dock-app app-photos" href="#work" aria-label="Projects" data-label="Projects">
        <ResilientImage src="/icons/mac/photos.svg" alt="" aria-hidden="true" />
      </a>
      <a className="creatie-dock-app app-finder" href="#services" aria-label="Services" data-label="Services">
        <ResilientImage src="/icons/mac/finder.svg" alt="" aria-hidden="true" />
      </a>
      <a className="creatie-dock-app app-mail" href="#contact" aria-label="Contact" data-label="Contact">
        <ResilientImage src="/icons/mac/mail.svg" alt="" aria-hidden="true" />
      </a>
    </nav>
  );
}

function PaperDecor({ variant }: { variant: "about" | "services" | "reviews" | "faq" }) {
  return (
    <div className={`creatie-paper-decor-v7 decor-${variant}`} aria-hidden="true">
      <span className="decor-spark">✦</span>
      <span className="decor-loop" />
      <span className="decor-note">MAKE<br />IT CLEAR</span>
      <span className="decor-smile">:)</span>
    </div>
  );
}

function ProjectCard({ project, index, label, onOpen }: { project: Project; index: number; label: string; onOpen: (project: Project) => void }) {
  const { t } = useLanguage();
  const media = project.cover?.url ? project.cover : firstMedia(project);
  const angle = [-4, 2, -2, 3, -3][index % 5];
  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className={`creatie-project-card project-${index + 1}`}
      style={{ "--card-angle": `${angle}deg` } as CSSProperties}
      aria-label={`${label}: ${t(project.title)}`}
    >
      <div className="creatie-window-bar"><i /><i /><i /><b /></div>
      <div className="creatie-project-image">
        {media ? (
          <ResilientImage
            src={media.thumbnailUrl || media.url}
            fallbackSrc={media.url}
            alt={t(media.alt || media.title) || t(project.title)}
            loading="lazy"
          />
        ) : (
          <div className="creatie-project-placeholder" style={{ background: project.accent }}>{t(project.title)}</div>
        )}
      </div>
      <footer>
        <strong>{t(project.title)}</strong>
        <span>{t(project.category)}{project.year ? ` / ${project.year}` : ""}</span>
      </footer>
    </button>
  );
}

function ProjectPreviewModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useLanguage();
  const resolveAssetPath = useAssetPath();
  const [zoomedMedia, setZoomedMedia] = useState<UploadedMedia | null>(null);
  const media = project.sections.flatMap((section) => section.media ?? []);
  const cover = media[0];

  useEffect(() => {
    const scrollY = window.scrollY;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousBodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.body.classList.add("is-modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    window.dispatchEvent(new Event("portfolio:modal-open"));
    return () => {
      document.body.classList.remove("is-modal-open");
      document.documentElement.style.scrollBehavior = "auto";
      Object.assign(document.body.style, previousBodyStyles);
      window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
      window.dispatchEvent(new CustomEvent("portfolio:modal-close", { detail: { scrollY } }));
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollY, left: 0, behavior: "auto" });
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    };
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomedMedia) setZoomedMedia(null);
      else onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, zoomedMedia]);

  return (
    <div className="creatie-project-modal-v7" role="dialog" aria-modal="true" aria-label={t(project.title)} onClick={onClose}>
      <div className="creatie-project-modal-window-v7" onClick={(event) => event.stopPropagation()}>
        <div className="creatie-project-modal-bar-v7">
          <span><i /><i /><i /></span>
          <small>Case Study / {t(project.category)}</small>
          <button type="button" onClick={onClose} aria-label="Close project preview">×</button>
        </div>
        <div className="creatie-project-modal-body-v7">
          {cover && <button type="button" className="creatie-project-modal-cover-v7 is-zoomable" onClick={() => setZoomedMedia(cover)} aria-label={`Enlarge ${t(project.title)}`}><ResilientImage src={cover.url} fallbackSrc={cover.thumbnailUrl || cover.url} alt={t(project.title)} priority /></button>}
          <header>
            <div>
              <span>{t(project.category)} · {project.year}</span>
              <h2>{t(project.title)}</h2>
              <p>{t(project.summary)}</p>
            </div>
            <dl>
              <div><dt>Role</dt><dd>{t(project.role)}</dd></div>
              <div><dt>Project type</dt><dd>{t(project.category)}</dd></div>
            </dl>
          </header>
          {media.length > 1 && <div className="creatie-project-modal-gallery-v7">
            {media.slice(1).map((item, index) => item.mimeType?.startsWith("video/") ? (
              <video key={`${item.url}-${index}`} src={resolveAssetPath(item.url)} controls playsInline />
            ) : item.mimeType === "application/pdf" ? (
              <a key={`${item.url}-${index}`} href={resolveAssetPath(item.url)} target="_blank" rel="noreferrer">Open PDF</a>
            ) : (
              <button key={`${item.url}-${index}`} type="button" className="creatie-project-modal-gallery-image-v7" onClick={() => setZoomedMedia(item)} aria-label={`Enlarge ${t(item.alt || item.title) || t(project.title)}`}>
                <ResilientImage src={item.url} fallbackSrc={item.thumbnailUrl || item.url} alt={t(item.alt || item.title) || t(project.title)} loading="lazy" />
              </button>
            ))}
          </div>}
          <footer>
            <Link href={`/projects/${project.slug}`}>View full project ↗</Link>
            <button type="button" onClick={onClose}>Close</button>
          </footer>
        </div>
      </div>
      {zoomedMedia && (
        <div
          className="creatie-project-image-lightbox-v7"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={(event) => {
            event.stopPropagation();
            setZoomedMedia(null);
          }}
        >
          <button type="button" onClick={() => setZoomedMedia(null)} aria-label="Close image preview">×</button>
          <ResilientImage src={zoomedMedia.url} fallbackSrc={zoomedMedia.thumbnailUrl || zoomedMedia.url} alt={t(zoomedMedia.alt || zoomedMedia.title) || t(project.title)} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export function HomePage({ projects, site }: HomePageProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const resolveAssetPath = useAssetPath();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [projectStackOpen, setProjectStackOpen] = useState(false);
  const projectStackCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const text = copy[language];
  const featured = useMemo(() => {
    const ordered = [...projects].sort((a, b) => a.order - b.order);
    return ordered.filter((project) => project.featured !== false);
  }, [projects]);
  const workCardStyle = site.workCardStyle;
  const workStageStyle = {
    "--work-card-width": `${boundedNumber(workCardStyle?.width, 500, 360, 620)}px`,
    "--work-card-height": `${boundedNumber(workCardStyle?.height, 380, 300, 520)}px`,
    "--work-card-gap": `${boundedNumber(workCardStyle?.gap, 32, 12, 72)}px`,
    "--work-card-title-size": `${boundedNumber(workCardStyle?.titleFontSize, 22, 14, 40)}px`,
    "--work-card-meta-size": `${boundedNumber(workCardStyle?.metaFontSize, 12, 9, 24)}px`,
  } as CSSProperties;
  const education = [site.education, site.education2].filter(Boolean) as NonNullable<SiteContent["education2"]>[];
  const heroBackground = resolveAssetPath("/images/ai-bg-081.webp");
  const landscapeBackground = heroBackground;
  const contactBackground = resolveAssetPath("/images/contact-gradient-02.webp");
  const profileSummary = language === "zh"
    ? "9 年产品与体验设计经验，专注 UI/UX、AI 设计和跨端体验，让复杂业务变得清晰、可信且真正好用。"
    : "9 years shaping UI/UX, AI-assisted design and cross-platform products into clear, useful digital experiences.";
  const aboutRailRef = useRef<HTMLDivElement>(null);
  const aboutDragRef = useRef({ active: false, startX: 0, scrollLeft: 0 });
  const aboutSummary =
    language === "zh"
      ? "9 年设计工作经验，擅长 AI 设计、C 端、B 端 UI 与交互设计，熟悉多平台设计规范，能独立完成从前期规划到最终交付的全流程设计。精通 APP、小程序、H5、数据可视化及 B 端管理后台设计，拥有丰富的跨行业设计项目经验和开发协作能力。"
      : t(site.bio) || t(site.intro);
  const aboutSkills =
    language === "zh"
      ? "1、设计工具：Codex、Nanobanana、ChatGpt、Gemini、Sketch、Figma、Photoshop、Illustrator、Axure RP\n\n2、前端协作：熟悉HTML、CSS，掌握开发沟通流程\n\n3、丰富的C端与B端设计经验，覆盖互联网、移动通信、电商等领域\n\n4、精通跨部门协作与开发对接，具备优秀的执行力与团队合作能力。\n\n5、摄影、剪辑、灯光布置，懂点小红书、抖音、视频号运营"
      : "1. Design tools: Codex, Nanobanana, ChatGPT, Gemini, Sketch, Figma, Photoshop, Illustrator and Axure RP.\n\n2. Front-end collaboration: familiar with HTML and CSS, with a clear development handoff workflow.\n\n3. Rich consumer and enterprise product experience across internet, telecom and commerce.\n\n4. Strong cross-functional collaboration, execution and development handoff skills.\n\n5. Photography, editing, lighting and social content operations.";
  const faqItems = language === "zh"
    ? [
        ["你可以设计什么？", "产品策略、UI/UX、设计系统、网站、移动端产品与视觉传播。"],
        ["最快多久可以开始？", "确认需求和时间后即可排期，通常会先用一个短会把目标与范围梳理清楚。"],
        ["你会和开发协作吗？", "会。我熟悉设计交付、开发沟通、走查与上线验收，能持续跟进实现质量。"],
        ["开始前需要我提供什么？", "一份简短需求、已有资料和期望时间即可，我会把它们整理成清晰的项目计划。"],
      ]
    : [
        ["What can you design?", "Product strategy, UI/UX, design systems, websites, mobile products and visual communication."],
        ["How fast can we start?", "Once scope and timing are aligned, we can schedule a short kickoff and turn the brief into a clear plan."],
        ["Do you work with developers?", "Yes. I support handoff, implementation reviews and launch QA to protect the design quality."],
        ["What do you need from me?", "A short brief, any existing materials and your ideal timeline are enough to get started."],
      ];
  const scrollAboutRail = (direction: number) => {
    const rail = aboutRailRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.min(520, rail.clientWidth * 0.82), behavior: "smooth" });
  };
  const handleAboutPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    aboutDragRef.current = { active: true, startX: event.clientX, scrollLeft: event.currentTarget.scrollLeft };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
  };
  const handleAboutPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!aboutDragRef.current.active) return;
    event.currentTarget.scrollLeft = aboutDragRef.current.scrollLeft - (event.clientX - aboutDragRef.current.startX);
  };
  const stopAboutDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    aboutDragRef.current.active = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const handleAboutWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const canScroll =
      event.deltaY > 0
        ? rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1
        : rail.scrollLeft > 0;
    if (!canScroll) return;
    event.preventDefault();
    rail.scrollLeft += event.deltaY;
  };
  const openProjectStack = () => {
    if (projectStackCloseTimer.current) clearTimeout(projectStackCloseTimer.current);
    setProjectStackOpen(true);
  };
  const scheduleProjectStackClose = () => {
    if (projectStackCloseTimer.current) clearTimeout(projectStackCloseTimer.current);
    projectStackCloseTimer.current = setTimeout(() => setProjectStackOpen(false), 180);
  };

  useEffect(() => () => {
    if (projectStackCloseTimer.current) clearTimeout(projectStackCloseTimer.current);
  }, []);

  return (
    <main className="creatie-page-v7">
      <CursorEyes />
      <Dock />

      <section className="creatie-hero-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(15,34,33,.08), rgba(12,29,27,.22)), url("${heroBackground}")` }}>
        <header className="creatie-topbar-v7">
          <a href="#top" className="creatie-brand-v7">{site.name || "CREATIE"}</a>
          <div className="creatie-language-v7">
            <button type="button" className="creatie-language-trigger-v7" aria-label="Choose language">
              {language === "zh" ? "CN" : "EN"}<i />
            </button>
            <div className="creatie-language-menu-v7" role="menu">
              <span>LANGUAGE</span>
              <button type="button" className={language === "zh" ? "is-active" : ""} onClick={() => language !== "zh" && toggleLanguage()}>中文 <b>CN</b></button>
              <button type="button" className={language === "en" ? "is-active" : ""} onClick={() => language !== "en" && toggleLanguage()}>English <b>EN</b></button>
            </div>
          </div>
        </header>
        <aside
          id="top"
          className="creatie-status-v7"
          data-open={profileOpen ? "true" : "false"}
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <button type="button" className="creatie-status-trigger-v7" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
            {site.aboutPhoto?.url ? <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} /> : <span className="creatie-avatar-fallback">PW</span>}
            <span><i />{text.available}<strong>{site.name} / {t(site.shortRole)}</strong></span>
            <b className="creatie-status-toggle-v7">{profileOpen ? "−" : "+"}</b>
          </button>
          <div className="creatie-status-details-v7">
            <p>{profileSummary}</p>
            <div><span>UI/UX Design</span><span>AI Design</span><span>Product Experience</span></div>
            <a href={`mailto:${site.email}`}>{language === "zh" ? "联系合作" : "Start a project"}<b>↗</b></a>
          </div>
        </aside>
        <div className="creatie-hero-title-v7">
          <span className="creatie-eyes-static" aria-hidden="true"><i /><i /></span>
          <h1><span>{text.heroA}</span><span>{text.heroB}</span></h1>
          <div className="creatie-skill-tag tag-a"><i>✦</i>UI/UX Design<em /></div>
          <div className="creatie-skill-tag tag-b"><i>⌁</i>AI Design<em /></div>
          <div className="creatie-skill-tag tag-c"><i>◈</i>Visual Design<em /></div>
        </div>
        <p className="creatie-hero-note-v7"><i />{text.heroNote}</p>
        {featured[0] && (
          <div
            className="creatie-mini-project-stack-v7"
            data-open={projectStackOpen ? "true" : "false"}
            onPointerEnter={openProjectStack}
            onPointerLeave={scheduleProjectStackClose}
            onFocus={openProjectStack}
            onBlur={scheduleProjectStackClose}
            aria-label={language === "zh" ? "精选作品" : "Featured projects"}
          >
            {featured.slice(0, 3).map((project, index) => {
              const media = firstMedia(project);
              return (
                <button
                  type="button"
                  key={project.slug}
                  onClick={() => setActiveProject(project)}
                  className="creatie-mini-project-v7"
                  style={{ "--stack-depth": index } as CSSProperties}
                  aria-label={`${text.view}: ${t(project.title)}`}
                >
                  {media && <ResilientImage src={media.thumbnailUrl || media.url} fallbackSrc={media.url} alt={t(project.title)} />}
                  <span><small>{t(project.category)} · {project.year}</small><strong>{t(project.title)}</strong><em>{language === "zh" ? "查看案例" : "View case study"}</em></span>
                  <b>&rarr;</b>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section id="about" className="creatie-paper-section creatie-about-v7">
        <PaperDecor variant="about" />
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7">
            <span>{text.about}</span>
            <h2>{text.aboutTitle}</h2>
          </div>
          <div className="creatie-about-profile-v7">
            <button type="button" className="creatie-about-photo-v7" onClick={() => setPhotoOpen(true)} disabled={!site.aboutPhoto?.url} aria-label="Open portrait">
              {site.aboutPhoto?.url ? <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} /> : <span>PW</span>}
            </button>
            <div className="creatie-about-identity-v7">
              <h3>{site.name}</h3>
              <p>{t(site.shortRole)}</p>
              <div><a href={`mailto:${site.email}`}>{site.email}</a>{site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}</div>
            </div>
          </div>
          <div className="creatie-about-rail-head-v8">
            <span>{text.swipeHint}</span>
            <div className="creatie-about-rail-actions-v8">
              <button type="button" onClick={() => scrollAboutRail(-1)} aria-label={text.previousCard}>&larr;</button>
              <button type="button" onClick={() => scrollAboutRail(1)} aria-label={text.nextCard}>&rarr;</button>
            </div>
          </div>
          <div
            ref={aboutRailRef}
            className="creatie-about-rail-v8"
            onPointerDown={handleAboutPointerDown}
            onPointerMove={handleAboutPointerMove}
            onPointerUp={stopAboutDrag}
            onPointerCancel={stopAboutDrag}
            onPointerLeave={(event) => {
              if (aboutDragRef.current.active) stopAboutDrag(event);
            }}
            onWheel={handleAboutWheel}
          >
            <article className="creatie-about-card-v8 is-bio-skills">
              <i className="creatie-about-card-pin-v8" aria-hidden="true" />
              <small>01 / {text.profileSummary} · {text.capabilities}</small>
              <h3>{text.profileSummary}</h3>
              <p>{aboutSummary}</p>
              <div className="creatie-about-card-divider-v8" aria-hidden="true" />
              <h4>{text.capabilities}</h4>
              <p>{aboutSkills}</p>
            </article>
              {education.length > 0 && (
                <article className="creatie-about-card-v8 is-education">
                  <i className="creatie-about-card-pin-v8" aria-hidden="true" />
                  <small>02 / {text.education}</small>
                  <h3>{text.education}</h3>
                  <div className="creatie-about-education-stack-v8">
                    {education.map((item, index) => (
                      <div className="creatie-about-education-entry-v8" key={`${t(item.school)}-${index}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          <h4>{t(item.school)}</h4>
                          <p>{t(item.degree)}</p>
                          <time>{t(item.time)}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
              {site.experiences.map((item, index) => (
                <article className="creatie-about-card-v8 is-experience" key={`${t(item.company)}-${index}`}>
                  <i className="creatie-about-card-pin-v8" aria-hidden="true" />
                  <small>{String(index + (education.length > 0 ? 3 : 2)).padStart(2, "0")} / {text.experience}</small>
                <h3>{t(item.company)}</h3>
                <div className="creatie-about-card-meta-v8">
                  <strong>{t(item.position)}</strong>
                  <span>{t(item.time)}</span>
                </div>
                <p>{t(item.description)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="creatie-landscape-section creatie-work-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(241,238,217,.08), rgba(40,61,38,.12)), url("${landscapeBackground}")` }}>
        <div className="creatie-section-heading-v7 dark-heading">
          <span className={richStyleClass(site.workLabelStyle)}>{t(site.workLabel) || text.projects}</span>
          <h2 className={richStyleClass(site.workIntroStyle)}>{t(site.workIntro) || text.projectsTitle}</h2>
        </div>
        <div className="creatie-project-stage-v7" style={workStageStyle}>
          {featured.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} label={text.view} onOpen={setActiveProject} />)}
        </div>
      </section>

      <section id="services" className="creatie-paper-section creatie-services-v7">
        <PaperDecor variant="services" />
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.services}</span><h2>{text.servicesTitle}</h2></div>
          <div className="creatie-service-list-v7">
            {serviceRows.map(([title, detail], index) => <article key={title} style={{ "--row": index } as CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p><b>&rarr;</b></article>)}
          </div>
        </div>
      </section>

      <section className="creatie-paper-section creatie-reviews-v7">
        <PaperDecor variant="reviews" />
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.reviews}</span><h2>{text.reviewsTitle}</h2></div>
          <div className="creatie-review-cards-v7">
            <article><small>01</small><h3>"Clear thinking, strong execution."</h3><p>The work turned a complex product into a system people could understand and use.</p></article>
            <article><small>02</small><h3>"The flow became much easier."</h3><p>Every decision felt focused, practical and ready for development.</p></article>
            <article><small>03</small><h3>"Sharp design without noise."</h3><p>A thoughtful balance of visual character, usability and business goals.</p></article>
          </div>
        </div>
      </section>

      <section className="creatie-paper-section creatie-faq-v7">
        <PaperDecor variant="faq" />
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.faq}</span><h2>{text.faqTitle}</h2></div>
          <div className="creatie-faq-grid-v7">
            {faqItems.map(([question, answer], index) => {
              const isOpen = openFaq === index;
              return (
                <article key={question} data-open={isOpen ? "true" : "false"}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`}>
                    <strong>{question}</strong><b aria-hidden="true">+</b>
                  </button>
                  <div id={`faq-answer-${index}`} className="creatie-faq-answer-v7"><div><p>{answer}</p></div></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="creatie-contact-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04)), url("${contactBackground}")` }}>
        <div><span>{text.contact}</span><h2>{text.contactTitle}</h2><a href={`mailto:${site.email}`}>{text.start} &rarr;</a></div>
        <footer><strong>{site.name}</strong><nav>{site.social.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>)}</nav></footer>
      </section>

      {photoOpen && site.aboutPhoto?.url && (
        <div className="creatie-photo-modal-v7" role="dialog" aria-modal="true" onClick={() => setPhotoOpen(false)}>
          <button type="button" onClick={() => setPhotoOpen(false)} aria-label="Close">x</button>
          <ResilientImage src={site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
      {activeProject && <ProjectPreviewModal project={activeProject} onClose={() => setActiveProject(null)} />}
    </main>
  );
}
