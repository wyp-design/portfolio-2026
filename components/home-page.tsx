"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { looksGarbled, useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";

const meadowImage = "/images/creatie-bg.avif";

type Lang = "zh" | "en";
type GooglyEyesMode = "watch" | "cursor";

function cleanText(value?: string, fallback = "") {
  if (!value || looksGarbled(value)) return fallback;
  return value;
}

function textOf(value: { zh: string; en: string } | undefined, lang: Lang, fallback = "") {
  if (!value) return fallback;
  return cleanText(value[lang]) || cleanText(value[lang === "zh" ? "en" : "zh"]) || fallback;
}

function firstMedia(project: Project) {
  return project.sections.flatMap((section) => section.media || []).find((media) => media?.url);
}

function mediaCount(project: Project) {
  return project.sections.reduce((total, section) => total + (section.media?.length || 0), 0);
}

function GooglyEyes({ className = "", mode = "watch" }: { className?: string; mode?: GooglyEyesMode }) {
  const [point, setPoint] = useState({ x: 0, y: 0, cursorX: -120, cursorY: -120 });

  useEffect(() => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
    const handlePointerMove = (event: PointerEvent) => {
      const x = clamp((event.clientX / window.innerWidth - 0.5) * 14, -7, 7);
      const y = clamp((event.clientY / window.innerHeight - 0.5) * 12, -6, 6);
      setPoint({ x, y, cursorX: event.clientX, cursorY: event.clientY });
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const style =
    mode === "cursor"
      ? ({
          "--cursor-x": `${point.cursorX}px`,
          "--cursor-y": `${point.cursorY}px`,
          "--eye-x": `${point.x}px`,
          "--eye-y": `${point.y}px`,
        } as CSSProperties)
      : ({ "--eye-x": `${point.x}px`, "--eye-y": `${point.y}px` } as CSSProperties);

  return (
    <span
      className={`creatie-eyes ${mode === "cursor" ? "creatie-eyes-cursor" : ""} ${className}`}
      style={style}
      aria-hidden="true"
    >
      <i />
      <i />
    </span>
  );
}

function StickyLabel({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`sticky-label ${className}`}>
      <b>✓</b>
      {label}
      <i />
    </span>
  );
}

function DockIcon({ type }: { type: "notes" | "photos" | "finder" | "mail" }) {
  if (type === "notes") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="15" fill="#fff7d1" />
        <path d="M0 14h64v12H0z" fill="#ffcb22" />
        <path d="M12 34h40M12 44h34" stroke="#b8b0a2" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "photos") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="15" fill="#fff" />
        {["#ff5b60", "#ff9c38", "#ffd23f", "#39c66a", "#34b8ff", "#5d6cff", "#b45cff", "#ff68ba"].map((color, index) => (
          <ellipse
            key={color}
            cx="32"
            cy="20"
            rx="8"
            ry="15"
            fill={color}
            opacity=".9"
            transform={`rotate(${index * 45} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="8" fill="#fff" />
      </svg>
    );
  }

  if (type === "finder") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="15" fill="#3ab8ff" />
        <path
          d="M32 0v64M18 24c3 3 7 3 10 0M42 24c3 3 7 3 10 0M18 43c8 7 20 7 28 0"
          stroke="#10141a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M32 0v64" stroke="#0c6ed0" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#7ed1ff" />
      <rect x="10" y="16" width="44" height="32" rx="5" fill="#f4fbff" />
      <path d="m12 20 20 16 20-16M12 46l15-14M52 46 37 32" stroke="#5c8eb0" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MacDock({ email }: { email: string }) {
  const items = [
    { label: "About", href: "#about", icon: "notes" as const },
    { label: "Work", href: "#projects", icon: "photos" as const },
    { label: "Home", href: "#hero", icon: "finder" as const },
    { label: "Mail", href: `mailto:${email}`, icon: "mail" as const },
  ];

  return (
    <nav className="mac-dock" aria-label="Quick navigation">
      {items.map((item) => (
        <a key={item.label} href={item.href} aria-label={item.label}>
          <DockIcon type={item.icon} />
          <em>{item.label}</em>
        </a>
      ))}
    </nav>
  );
}

function MediaPreview({ media, alt, className = "" }: { media?: UploadedMedia; alt: string; className?: string }) {
  const resolveAssetPath = useAssetPath();
  const mediaUrl = media?.thumbnailUrl || media?.url || "";

  if (!mediaUrl) {
    return (
      <div className={`project-card-placeholder ${className}`}>
        <span>{alt}</span>
      </div>
    );
  }

  if (media?.mimeType?.startsWith("video/")) {
    return <video className={className} src={resolveAssetPath(mediaUrl)} muted playsInline preload="metadata" />;
  }

  if (media?.mimeType === "application/pdf" || mediaUrl.toLowerCase().endsWith(".pdf")) {
    return (
      <div className={`project-card-placeholder ${className}`}>
        <span>PDF</span>
      </div>
    );
  }

  return <ResilientImage className={className} src={mediaUrl} fallbackSrc={media?.url} alt={alt} loading="lazy" />;
}

function BrowserProjectCard({ project, index, lang }: { project: Project; index: number; lang: Lang }) {
  const title = textOf(project.title, lang, `Project ${index + 1}`);
  const role = textOf(project.role, lang, "UI Design");
  const media = firstMedia(project);

  return (
    <Link href={`/projects/${project.slug}`} className={`browser-project-card card-tilt-${(index % 5) + 1}`}>
      <div className="browser-dots">
        <i />
        <i />
        <i />
      </div>
      <div className="browser-project-media">
        <MediaPreview media={media} alt={title} />
      </div>
      <footer>
        <strong>{title}</strong>
        <span>{role}</span>
        <span>{project.year || "2026"}</span>
      </footer>
    </Link>
  );
}

function ServiceRow({ title, index }: { title: string; index: number }) {
  const colors = ["#ffe6e6", "#dfeeff", "#fff7bd", "#dff7e6", "#eee8ff"];
  const icons = ["↗", "✦", "▣", "→", "◌"];

  return (
    <div className="service-row" style={{ "--service-color": colors[index % colors.length] } as CSSProperties}>
      <strong>{title}</strong>
      <span>{icons[index % icons.length]}</span>
    </div>
  );
}

function ReviewCard({ quote, name, role, index }: { quote: string; name: string; role: string; index: number }) {
  return (
    <article className={`review-card review-${["one", "two", "three"][index] || "one"}`}>
      <i />
      <header>
        <span>{name.slice(0, 1)}</span>
        <div>
          <strong>{name}</strong>
          <small>{role}</small>
        </div>
      </header>
      <h3>“{quote}”</h3>
      <p>★★★★★</p>
    </article>
  );
}

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const { language, setLanguage } = useLanguage();
  const lang = language as Lang;
  const orderedProjects = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);
  const featuredProjects = orderedProjects.slice(0, 5);
  const totalMedia = orderedProjects.reduce((total, project) => total + mediaCount(project), 0);

  const intro = textOf(
    site.intro,
    lang,
    lang === "zh" ? "我把复杂系统变成清晰、有人情味的数字体验。" : "I turn complex systems into clear, human digital experiences.",
  );

  return (
    <main className="creatie-page-v3">
      <GooglyEyes className="site-googly-eyes" mode="cursor" />
      <MacDock email={site.email} />

      <header className="creatie-topbar">
        <Link href="#hero" className="brand-mark">
          {cleanText(site.name, "Penn.W")}
        </Link>
        <nav>
          <Link href="#about">{lang === "zh" ? "关于" : "About"}</Link>
          <Link href="#projects">{lang === "zh" ? "作品" : "Projects"}</Link>
          <Link href="#contact">{lang === "zh" ? "联系" : "Contact"}</Link>
          <button type="button" onClick={() => setLanguage(lang === "zh" ? "en" : "zh")}>
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </nav>
      </header>

      <section className="creatie-hero-v3" id="hero" style={{ "--hero-bg": `url(${meadowImage})` } as CSSProperties}>
        <div className="availability-pill">
          <span className="avatar-dot">{cleanText(site.name, "P").slice(0, 1)}</span>
          <div>
            <small>{lang === "zh" ? "可合作" : "Available for work"}</small>
            <strong>{textOf(site.shortRole, lang, "UI/UX Designer")}</strong>
          </div>
        </div>
        <GooglyEyes className="hero-eyes" />
        <div className="hero-title-card">
          <StickyLabel label="UI/UX Design" className="label-ui" />
          <StickyLabel label="Illustration" className="label-ill" />
          <StickyLabel label="3D Design" className="label-3d" />
          <h1>{lang === "zh" ? <>设计让<br />人多看一眼</> : <>Design that<br />makes people<br />look twice</>}</h1>
        </div>
        <p className="hero-note">— {lang === "zh" ? "不只是视觉，我让数字体验有生命力。" : "Not just visuals, I make digital things look alive."}</p>
        <Link href={featuredProjects[0] ? `/projects/${featuredProjects[0].slug}` : "#projects"} className="hero-case">
          <span className="case-thumb">
            <MediaPreview media={featuredProjects[0] ? firstMedia(featuredProjects[0]) : undefined} alt="Featured project" />
          </span>
          <span>
            <small>{featuredProjects[0] ? textOf(featuredProjects[0].role, lang, "Case Study") : "Case Study"}</small>
            <strong>{featuredProjects[0] ? textOf(featuredProjects[0].title, lang, "Featured") : "Featured"}</strong>
            <em>{lang === "zh" ? "查看案例" : "View case study"}</em>
          </span>
        </Link>
      </section>

      <section className="creatie-about-v3 grid-paper" id="about">
        <StickyLabel label="About" className="section-label" />
        <GooglyEyes className="about-eyes" />
        <h2>{lang === "zh" ? "我让设计被记住" : "I make designs people remember"}</h2>
        <p className="about-lead">{intro}</p>
        <a className="pin-button" href={`mailto:${site.email}`}>
          {lang === "zh" ? "开始一个项目" : "Start a project"}
        </a>
        <div className="about-metrics">
          {(site.experiences || []).slice(0, 4).map((item, index) => (
            <article key={`${textOf(item.company, lang, "Company")}-${index}`} className={`metric-card metric-${index + 1}`}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <strong>{textOf(item.company, lang, "Company")}</strong>
              <span>{textOf(item.position, lang, "Designer")} · {textOf(item.time, lang, "Now")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="creatie-projects-v3" id="projects" style={{ "--project-bg": `url(${meadowImage})` } as CSSProperties}>
        <GooglyEyes className="projects-eyes" />
        <div className="section-heading-sticker">
          <StickyLabel label="Projects" className="section-label" />
          <h2>{lang === "zh" ? "会讲故事的项目" : "Projects that tell stories"}</h2>
        </div>
        <div className="floating-browser-cards">
          {featuredProjects.map((project, index) => (
            <BrowserProjectCard key={project.slug} project={project} index={index} lang={lang} />
          ))}
        </div>
      </section>

      <section className="creatie-folders-v3">
        <div className="folders-heading">
          <span>04 — {lang === "zh" ? "精选作品" : "Selected work"}</span>
          <span>
            {totalMedia} {lang === "zh" ? "个素材" : "assets"}
          </span>
        </div>
        <div className="folder-gallery-v3">
          {featuredProjects.map((project, index) => {
            const media = project.sections.flatMap((section) => section.media || []).slice(0, 3);
            const colors = ["#b8ff58", "#ff7269", "#8580ff", "#f6cf3d", "#58c9e8"];
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="creatie-folder-card"
                style={{ "--folder-color": colors[index % colors.length] } as CSSProperties}
              >
                <div className="folder-stack">
                  <span className="folder-back" />
                  <span className="folder-sheets">
                    {[0, 1, 2].map((slot) => (
                      <span key={slot} className={`folder-sheet sheet-${slot + 1}`}>
                        <MediaPreview media={media[slot]} alt={textOf(project.title, lang, "Project")} />
                      </span>
                    ))}
                  </span>
                  <span className="folder-pocket" />
                </div>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{textOf(project.title, lang, `Project ${index + 1}`)}</h3>
                <p>
                  {mediaCount(project)} {lang === "zh" ? "个素材" : "assets"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="creatie-services-v3 grid-paper">
        <StickyLabel label="Services" className="section-label" />
        <h2>{lang === "zh" ? "我能帮你做什么" : "Where I can help you"}</h2>
        <div className="service-list">
          {[
            lang === "zh" ? "网站与落地页设计" : "Website Design",
            "UI/UX Design",
            lang === "zh" ? "品牌视觉系统" : "Brand Identity",
            lang === "zh" ? "AI 视觉探索" : "AI Exploration",
            lang === "zh" ? "产品体验优化" : "Product Experience",
          ].map((item, index) => (
            <ServiceRow key={item} title={item} index={index} />
          ))}
        </div>
      </section>

      <section className="creatie-reviews-v3 grid-paper">
        <StickyLabel label="Proof" className="section-label" />
        <h2>{lang === "zh" ? "把想法变成可感知的体验" : "Design that turns ideas into experiences"}</h2>
        <div className="review-cloud">
          <ReviewCard
            index={0}
            name="Product Team"
            role="Workflow"
            quote={lang === "zh" ? "信息结构终于清晰了，团队协作更顺了。" : "The information structure finally feels clear."}
          />
          <ReviewCard
            index={1}
            name="AI Project"
            role="Prototype"
            quote={lang === "zh" ? "复杂流程被拆成了可复用的系统。" : "Complex workflows became reusable systems."}
          />
          <ReviewCard
            index={2}
            name="Visual System"
            role="Launch"
            quote={lang === "zh" ? "视觉更完整，交付也更稳定。" : "The visual system feels sharper and easier to ship."}
          />
        </div>
      </section>

      <section className="creatie-contact-v3" id="contact" style={{ "--contact-bg": `url(${meadowImage})` } as CSSProperties}>
        <GooglyEyes className="contact-eyes" />
        <div className="social-bubbles">
          {site.social?.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label.slice(0, 1).toUpperCase()}
            </a>
          ))}
          <a href={`mailto:${site.email}`}>✉</a>
        </div>
        <p className="contact-idea">— {lang === "zh" ? "有想法？我们把它变成清晰的数字体验。" : "Have an idea? Let’s turn it into a sharp digital experience."}</p>
        <div className="contact-big">
          <StickyLabel label="UI/UX Design" />
          <h2>{lang === "zh" ? <>一起做点<br />有意思的东西</> : <>Let’s build<br />something<br />memorable</>}</h2>
        </div>
        <a className="chat-button" href={`mailto:${site.email}`}>
          {lang === "zh" ? "聊一聊" : "Let’s chat"}
        </a>
        <footer>
          <strong>{cleanText(site.name, "Penn.W")}</strong>
          <nav>
            <Link href="#about">{lang === "zh" ? "关于" : "About"}</Link>
            <Link href="#projects">{lang === "zh" ? "作品" : "Projects"}</Link>
            <Link href="#contact">{lang === "zh" ? "联系" : "Contact"}</Link>
          </nav>
        </footer>
      </section>
    </main>
  );
}
