"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { useAssetPath } from "@/lib/use-asset-path";
import { looksGarbled, useLanguage } from "@/lib/i18n";
import { ResilientImage } from "./resilient-image";

const meadowImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85";

const folderColors = ["#b8ff58", "#ff7b70", "#8d86ff", "#ffd846", "#42cfe7", "#9f70ff"];
const serviceColors = ["#ffe0e1", "#d9ecff", "#fff7ba", "#dff7e3", "#efe8ff"];

function safeText(value: string | undefined, fallback: string) {
  if (!value || looksGarbled(value)) return fallback;
  return value;
}

function isPdf(media?: UploadedMedia) {
  return media?.mimeType === "application/pdf";
}

function isVideo(media?: UploadedMedia) {
  return Boolean(media?.mimeType?.startsWith("video/"));
}

function allMedia(project: Project) {
  return project.sections.flatMap((section) => section.media || []);
}

function previewMedia(project?: Project) {
  if (!project) return [];
  return allMedia(project).filter((media) => !isPdf(media)).slice(0, 4);
}

function localized(project: Project, field: "title" | "summary" | "category", language: "zh" | "en", fallback: string) {
  return safeText(project[field]?.[language], fallback);
}

function usePointerEyes() {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 10;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      setPoint({ x, y });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return point;
}

function MouseEyes({ className = "" }: { className?: string }) {
  const point = usePointerEyes();
  return (
    <span className={`creatie-eyes ${className}`} aria-hidden="true">
      <i style={{ "--eye-x": `${point.x}px`, "--eye-y": `${point.y}px` } as CSSProperties} />
      <i style={{ "--eye-x": `${point.x}px`, "--eye-y": `${point.y}px` } as CSSProperties} />
    </span>
  );
}

function MacDock({ email }: { email: string }) {
  const icons = [
    { label: "Notes", icon: "▤", href: "#about" },
    { label: "Photos", icon: "✿", href: "#projects" },
    { label: "Finder", icon: "⌘", href: "#services" },
    { label: "Mail", icon: "✉", href: `mailto:${email}` },
  ];

  return (
    <div className="mac-dock" aria-label="Quick actions">
      {icons.map((item) => (
        <a key={item.label} href={item.href} aria-label={item.label}>
          {item.icon}
        </a>
      ))}
    </div>
  );
}

function StickyLabel({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span className={`sticky-label ${className}`}>
      <b>✦</b>
      {label}
      <em />
    </span>
  );
}

function MediaPreview({ media, title, eager = false }: { media?: UploadedMedia; title: string; eager?: boolean }) {
  const assetPath = useAssetPath();

  if (!media) {
    return <span className="project-card-placeholder">{title}</span>;
  }

  if (isVideo(media)) {
    return <video src={assetPath(media.url)} muted playsInline preload="metadata" />;
  }

  return (
    <ResilientImage
      src={media.thumbnailUrl || media.url}
      fallbackSrc={media.url}
      alt={safeText(media.alt?.zh || media.alt?.en, title)}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function BrowserProjectCard({ project, index }: { project: Project; index: number }) {
  const { language } = useLanguage();
  const title = localized(project, "title", language, `Project ${index + 1}`);
  const category = localized(project, "category", language, "Design");
  const media = previewMedia(project)[0];

  return (
    <Link className={`browser-project-card card-tilt-${(index % 5) + 1}`} href={`/projects/${project.slug}`}>
      <div className="browser-dots">
        <i />
        <i />
        <i />
      </div>
      <div className="browser-project-media">
        <MediaPreview media={media} title={title} eager={index < 2} />
      </div>
      <footer>
        <strong>{title}</strong>
        <span>{category}</span>
        <span>{project.year || "2026"}</span>
      </footer>
    </Link>
  );
}

function FolderCard({ project, index }: { project: Project; index: number }) {
  const { language } = useLanguage();
  const title = localized(project, "title", language, `Project ${index + 1}`);
  const count = allMedia(project).length || 1;
  const previews = previewMedia(project);
  const color = project.accent || folderColors[index % folderColors.length];

  return (
    <Link className="creatie-folder-card" href={`/projects/${project.slug}`} style={{ "--folder-color": color } as CSSProperties}>
      <div className="folder-stack" aria-hidden="true">
        <span className="folder-back" />
        <span className="folder-pocket" />
        <div className="folder-sheets">
          {[0, 1, 2].map((slot) => (
            <span className={`folder-sheet sheet-${slot + 1}`} key={slot}>
              <MediaPreview media={previews[slot]} title={title} eager={index < 2} />
            </span>
          ))}
        </div>
      </div>
      <small>{String(index + 1).padStart(2, "0")}</small>
      <h3>{title}</h3>
      <p>{count} 个素材</p>
    </Link>
  );
}

function ServiceRow({ label, index }: { label: string; index: number }) {
  return (
    <div className="service-row" style={{ "--service-color": serviceColors[index % serviceColors.length] } as CSSProperties}>
      <strong>{label}</strong>
      <span>{["▣", "◌", "◈", "↗", "☷"][index % 5]}</span>
    </div>
  );
}

function ReviewCard({ name, role, quote, className = "" }: { name: string; role: string; quote: string; className?: string }) {
  return (
    <article className={`review-card ${className}`}>
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
  const avatar = site.aboutPhoto;
  const heroProject = projects[0];
  const heroPreview = useMemo(() => previewMedia(heroProject)[0], [heroProject]);
  const role = safeText(site.shortRole?.[language], language === "zh" ? "UI/UX/AI 设计师" : "UI/UX/AI Designer");
  const intro = safeText(
    site.bio?.[language] || site.intro?.[language],
    language === "zh"
      ? "我把复杂系统变成清晰、有人情味的数字体验。"
      : "I turn complex systems into clear, human digital experiences.",
  );
  const social = site.social?.length ? site.social : [{ label: "Mail", href: `mailto:${site.email}` }];

  return (
    <main className="creatie-page-v3" style={{ "--meadow-image": `url(${meadowImage})` } as CSSProperties}>
      <header className="creatie-topbar">
        <Link href="/" className="creatie-logo">PENN.W</Link>
        <nav>
          <a href="#about">ABOUT</a>
          <a href="#projects">PROJECTS</a>
          <a href="#services">SERVICES</a>
          <a href="#contact">CONTACT</a>
          <button type="button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>
            {language === "zh" ? "EN" : "中文"}
          </button>
        </nav>
      </header>

      <section className="creatie-hero-v3">
        <MouseEyes className="hero-eyes" />
        <div className="hero-status">
          <span className="avatar-dot">
            {avatar?.url ? <ResilientImage src={avatar.thumbnailUrl || avatar.url} fallbackSrc={avatar.url} alt={site.name} /> : site.name.slice(0, 1)}
          </span>
          <div>
            <small>● Available for work</small>
            <strong>{site.name || "PENN.W"} · {role}</strong>
          </div>
        </div>

        <div className="hero-title-card">
          <h1>
            DESIGN THAT
            <br />
            MAKES PEOPLE
            <br />
            LOOK TWICE
          </h1>
          <StickyLabel label="UI/UX Design" className="label-ui" />
          <StickyLabel label="Illustration" className="label-ill" />
          <StickyLabel label="3D Design" className="label-3d" />
        </div>

        <p className="hero-note">— Not just visuals,<br />I make digital things look alive</p>
        <MacDock email={site.email} />

        <Link className="hero-case" href={heroProject ? `/projects/${heroProject.slug}` : "#projects"}>
          <span className="case-thumb">
            <MediaPreview media={heroPreview} title={heroProject ? localized(heroProject, "title", language, "Case") : "Case"} eager />
          </span>
          <span>
            <small>{heroProject?.category?.[language] || "CASE"}</small>
            <strong>{heroProject ? localized(heroProject, "title", language, "Project") : "Featured Project"}</strong>
            <em>VIEW CASE STUDY →</em>
          </span>
        </Link>
      </section>

      <section className="creatie-about-v3 grid-paper" id="about">
        <MouseEyes className="about-eyes" />
        <StickyLabel label="About" className="section-label" />
        <h2>I MAKE DESIGNS<br />PEOPLE REMEMBER</h2>
        <p className="about-lead">{intro}</p>
        <a className="pin-button" href="#contact">Start a project</a>

        <div className="about-metrics">
          {[
            ["8+", "Years of Experience", "跨平台产品、视觉与交互设计经验"],
            [`${projects.length || 5}+`, "Projects Designed", "从产品系统到品牌视觉的完整项目"],
            ["12+", "Industries explored", "AI、电商、移动端、数据可视化等领域"],
            ["100%", "Frontend aware", "懂设计，也理解落地与协作边界"],
          ].map(([num, title, body], index) => (
            <article className={`metric-card metric-${index + 1}`} key={title}>
              <b>{num}</b>
              <strong>{title}</strong>
              <span>{body}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="creatie-projects-v3" id="projects">
        <MouseEyes className="projects-eyes" />
        <StickyLabel label="Projects" className="section-label" />
        <h2>PROJECTS THAT<br />TELL STORIES</h2>
        <div className="floating-browser-cards">
          {projects.slice(0, 5).map((project, index) => (
            <BrowserProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="creatie-folders-v3">
        <div className="folders-heading">
          <span>04 — 精选作品</span>
          <p>跨 AI、移动产品、设计系统与数据体验。</p>
        </div>
        <div className="folder-gallery-v3">
          {projects.map((project, index) => (
            <FolderCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="creatie-services-v3 grid-paper" id="services">
        <StickyLabel label="Services" className="section-label" />
        <h2>WHERE I<br />CAN HELP YOU</h2>
        <div className="service-list">
          {["Website Design", "UI/UX Design", "Brand Identity", "Design Systems", "AI Exploration"].map((label, index) => (
            <ServiceRow key={label} label={label} index={index} />
          ))}
        </div>
      </section>

      <section className="creatie-reviews-v3 grid-paper">
        <MouseEyes className="reviews-eyes" />
        <h2>WORDS BETWEEN<br />THE PIXELS</h2>
        <div className="review-cloud">
          <ReviewCard name="Product Lead" role="B2B SaaS" quote="The flow became much easier to use." className="review-one" />
          <ReviewCard name="Founder" role="AI Tool" quote="The system finally feels like our brand." className="review-two" />
          <ReviewCard name="Design Partner" role="Startup" quote="Sharp design without overcomplicating it." className="review-three" />
        </div>
        <div className="faq-floaters">
          <a href="#contact">What can you design? +</a>
          <a href="#contact">How fast can we start? +</a>
          <a href="#contact">Do you build prototypes? +</a>
        </div>
        <MacDock email={site.email} />
      </section>

      <section className="creatie-contact-v3" id="contact">
        <MouseEyes className="contact-eyes" />
        <div className="social-bubbles">
          {social.slice(0, 4).map((item) => (
            <a key={item.label} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {item.label.slice(0, 1)}
            </a>
          ))}
          <a href={`mailto:${site.email}`}>✉</a>
        </div>
        <p className="contact-idea">— Have an idea?<br />Let’s turn it into a sharp digital experience.</p>
        <div className="contact-big">
          <StickyLabel label="UI/UX Design" />
          <h2>LET’S BUILD<br />SOMETHING<br />MEMORABLE</h2>
        </div>
        <MacDock email={site.email} />
        <a className="chat-button" href={`mailto:${site.email}`}>Let&apos;s chat</a>
        <footer>
          <strong>CREATIE®</strong>
          <nav>
            <a href="#about">ABOUT</a>
            <a href="#services">SERVICES</a>
            <a href="#projects">PROJECTS</a>
            <a href="#contact">CONTACT</a>
          </nav>
        </footer>
      </section>
    </main>
  );
}
