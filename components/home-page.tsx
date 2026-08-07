"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { looksGarbled, useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";

const meadowImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=85";

const folderColors = ["#b7ff4f", "#ff6f61", "#7b72f2", "#f7d33b", "#54c7e8"];

function cleanText(value?: string, fallback = "") {
  if (!value || looksGarbled(value)) return fallback;
  return value;
}

function textOf(value: { zh: string; en: string } | undefined, lang: "zh" | "en", fallback = "") {
  if (!value) return fallback;
  const primary = cleanText(value[lang]);
  const secondary = cleanText(value[lang === "zh" ? "en" : "zh"]);
  return primary || secondary || fallback;
}

function firstMedia(project: Project) {
  return project.sections.flatMap((section) => section.media || []).find((media) => media?.url);
}

function mediaCount(project: Project) {
  return project.sections.reduce((count, section) => count + (section.media?.length || 0), 0);
}

function GooglyEyes({ className = "" }: { className?: string }) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      setPoint({
        x: (event.clientX / window.innerWidth - 0.5) * 10,
        y: (event.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <span
      className={`creatie-eyes ${className}`}
      style={{ "--eye-x": `${point.x}px`, "--eye-y": `${point.y}px` } as CSSProperties}
      aria-hidden="true"
    >
      <i />
      <i />
    </span>
  );
}

function MacDock({ email }: { email: string }) {
  const items = [
    { label: "About", icon: "A", href: "#about" },
    { label: "Projects", icon: "P", href: "#projects" },
    { label: "Services", icon: "S", href: "#services" },
    { label: "Mail", icon: "M", href: `mailto:${email}` },
  ];

  return (
    <nav className="mac-dock" aria-label="Quick navigation">
      {items.map((item) => (
        <a key={item.label} href={item.href} aria-label={item.label}>
          <span>{item.icon}</span>
          <em>{item.label}</em>
        </a>
      ))}
    </nav>
  );
}

function StickyLabel({ label, tone = "blue" }: { label: string; tone?: "blue" | "pink" | "lime" }) {
  return (
    <span className={`sticky-label sticky-label-${tone}`}>
      <b>✓</b>
      {label}
      <em />
    </span>
  );
}

function MediaPreview({ media, alt }: { media?: UploadedMedia; alt: string }) {
  const resolveAssetPath = useAssetPath();
  const src = resolveAssetPath(media?.thumbnailUrl || media?.url || "");

  if (!src) {
    return (
      <div className="project-card-placeholder">
        <span>{alt}</span>
      </div>
    );
  }

  if (media?.mimeType?.startsWith("video/")) {
    return <video src={src} muted playsInline preload="metadata" />;
  }

  return <ResilientImage src={src} alt={alt} />;
}

function BrowserProjectCard({ project, index, lang }: { project: Project; index: number; lang: "zh" | "en" }) {
  const title = textOf(project.title, lang, `Project ${index + 1}`);
  const role = textOf(project.role, lang, "UI/UX");
  const cover = firstMedia(project);

  return (
    <Link href={`/projects/${project.slug}`} className={`browser-project-card card-tilt-${(index % 5) + 1}`}>
      <div className="browser-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="browser-project-media">
        <MediaPreview media={cover} alt={title} />
      </div>
      <div className="browser-project-footer">
        <strong>{title}</strong>
        <span>
          {role} · {project.year || "2026"}
        </span>
      </div>
    </Link>
  );
}

function FolderCard({ project, index, lang }: { project: Project; index: number; lang: "zh" | "en" }) {
  const title = textOf(project.title, lang, `Project ${index + 1}`);
  const cover = firstMedia(project);
  const resolveAssetPath = useAssetPath();
  const src = resolveAssetPath(cover?.thumbnailUrl || cover?.url || "");
  const count = mediaCount(project);
  const color = folderColors[index % folderColors.length];

  return (
    <Link href={`/projects/${project.slug}`} className="creatie-folder-card">
      <div className="folder-stack" style={{ "--folder-color": color } as CSSProperties}>
        <span className="folder-back" />
        <span className="folder-pocket" />
        <div className="folder-sheets" aria-hidden="true">
          <span className="folder-sheet sheet-one">
            {src ? <ResilientImage src={src} alt="" /> : <b>{title}</b>}
          </span>
          <span className="folder-sheet sheet-two">
            {src ? <ResilientImage src={src} alt="" /> : <b>{title}</b>}
          </span>
          <span className="folder-sheet sheet-three">
            <b>{title}</b>
          </span>
        </div>
      </div>
      <small>{String(index + 1).padStart(2, "0")}</small>
      <h3>{title}</h3>
      <p>{count || 1} 个素材</p>
    </Link>
  );
}

function ServiceRow({ label, index }: { label: string; index: number }) {
  const colors = ["pink", "blue", "yellow", "green", "violet"];
  return (
    <div className={`service-row service-row-${colors[index % colors.length]}`}>
      <span>{label}</span>
      <b>{["▣", "✦", "●", "→", "◇"][index % 5]}</b>
    </div>
  );
}

function ReviewCard({ quote, name, role, rotate }: { quote: string; name: string; role: string; rotate: number }) {
  return (
    <article className="review-card" style={{ "--rotate": `${rotate}deg` } as CSSProperties}>
      <span className="pin-dot" />
      <header>
        <b>{name}</b>
        <small>{role}</small>
      </header>
      <h3>“{quote}”</h3>
      <p>★★★★★</p>
    </article>
  );
}

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const { language, setLanguage } = useLanguage();
  const lang = language;
  const orderedProjects = useMemo(() => [...projects].sort((a, b) => a.order - b.order), [projects]);
  const featured = orderedProjects[0];
  const visibleSections = useMemo(
    () => [...(site.sections || [])].filter((section) => section.visible).sort((a, b) => a.order - b.order),
    [site.sections],
  );
  const sectionIsVisible = (id: string) => !visibleSections.length || visibleSections.some((section) => section.id === id);

  const name = cleanText(site.name, "Penn.W");
  const role = textOf(site.shortRole, lang, "UI/UX Designer");
  const intro = textOf(site.intro, lang, "I turn complex systems into clear, human digital experiences.");
  const location = textOf(site.location, lang, "深圳 · 面向世界");
  const featuredTitle = featured ? textOf(featured.title, lang, "Portfolio") : "Portfolio";
  const featuredMedia = featured ? firstMedia(featured) : undefined;

  return (
    <main className="creatie-page-v3">
      {sectionIsVisible("hero") && (
        <section className="creatie-hero-v3" id="hero" style={{ "--hero-bg": `url(${meadowImage})` } as CSSProperties}>
          <div className="hero-overlay" />
          <header className="creatie-topbar">
            <strong>{name}</strong>
            <nav>
              <a href="#projects">{lang === "zh" ? "作品" : "Work"}</a>
              <a href="#about">{lang === "zh" ? "关于" : "About"}</a>
              <a href="#contact">{lang === "zh" ? "联系" : "Contact"}</a>
              <button type="button" onClick={() => setLanguage(lang === "zh" ? "en" : "zh")}>
                {lang === "zh" ? "EN" : "中文"}
              </button>
            </nav>
          </header>

          <div className="availability-pill">
            <span className="avatar-dot">{name.slice(0, 1).toUpperCase()}</span>
            <div>
              <small>● {lang === "zh" ? "可接项目" : "Available for work"}</small>
              <b>
                {name} · {role}
              </b>
            </div>
          </div>

          <GooglyEyes className="hero-eyes" />
          <StickyLabel label="UI/UX Design" tone="lime" />
          <StickyLabel label="Illustration" tone="pink" />
          <StickyLabel label="3D Design" tone="blue" />

          <div className="hero-center-copy">
            <h1>
              DESIGN THAT
              <br />
              MAKES PEOPLE
              <br />
              LOOK TWICE
            </h1>
          </div>

          <p className="hero-note">— {intro}</p>
          <p className="hero-location">{location}</p>

          {featured && (
            <Link href={`/projects/${featured.slug}`} className="hero-mini-card">
              <div className="mini-thumb">
                <MediaPreview media={featuredMedia} alt={featuredTitle} />
              </div>
              <div>
                <small>{textOf(featured.category, lang, "Case Study")}</small>
                <b>{featuredTitle}</b>
                <span>{lang === "zh" ? "查看案例" : "View case study"} →</span>
              </div>
            </Link>
          )}

          <MacDock email={site.email} />
        </section>
      )}

      {sectionIsVisible("about") && (
        <section className="creatie-about-v3 grid-paper" id="about">
          <GooglyEyes />
          <div className="about-container-v3">
            <p className="section-label">02 — {textOf(site.aboutLabel, lang, lang === "zh" ? "关于我" : "About")}</p>
            <div className="about-profile-row">
              <button className="about-avatar-button" type="button" aria-label={lang === "zh" ? "查看头像" : "View avatar"}>
                <MediaPreview media={site.aboutPhoto} alt={name} />
              </button>
              <div>
                <h2>{name}</h2>
                <p>{role}</p>
                <div className="about-contact-line">
                  {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </div>
              </div>
            </div>
            <div className="about-lead">
              <h3>{textOf(site.aboutHeadline, lang, "I make designs people remember")}</h3>
              <p>{textOf(site.bio, lang, intro)}</p>
            </div>
            <div className="about-experience-list">
              {site.experiences.slice(0, 4).map((item, index) => (
                <article key={`${item.company.zh}-${index}`}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <h4>{textOf(item.company, lang, "Company")}</h4>
                  <b>
                    {textOf(item.position, lang, "Designer")} · {textOf(item.time, lang, "Now")}
                  </b>
                  <p>{textOf(item.description, lang, "")}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {sectionIsVisible("work") && (
        <section className="creatie-projects-v3" id="projects" style={{ "--project-bg": `url(${meadowImage})` } as CSSProperties}>
          <GooglyEyes />
          <div className="section-heading-sticker">
            <StickyLabel label="Projects" tone="blue" />
            <h2>{lang === "zh" ? "会讲故事的项目" : "Projects that tell stories"}</h2>
          </div>
          <div className="floating-browser-cards">
            {orderedProjects.slice(0, 5).map((project, index) => (
              <BrowserProjectCard key={project.slug} project={project} index={index} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {sectionIsVisible("work") && (
        <section className="creatie-folders-v3" id="folders">
          <div className="folders-heading">
            <p>04 — {textOf(site.workLabel, lang, lang === "zh" ? "精选作品" : "Selected work")}</p>
            <span>{textOf(site.workIntro, lang, "横跨 AI、移动产品、设计系统与数据体验。")}</span>
          </div>
          <div className="folder-gallery-v3">
            {orderedProjects.map((project, index) => (
              <FolderCard key={project.slug} project={project} index={index} lang={lang} />
            ))}
          </div>
        </section>
      )}

      {sectionIsVisible("manifesto") && (
        <section className="creatie-services-v3 grid-paper" id="services">
          <StickyLabel label="Services" tone="blue" />
          <h2>{lang === "zh" ? "我能帮你做什么" : "Where I can help you"}</h2>
          <div className="service-list">
            {[
              lang === "zh" ? "网站与落地页设计" : "Website Design",
              "UI/UX Design",
              lang === "zh" ? "品牌视觉与海报" : "Brand Identity",
              lang === "zh" ? "AI 产品体验探索" : "AI Exploration",
              lang === "zh" ? "设计系统搭建" : "Design Systems",
            ].map((label, index) => (
              <ServiceRow key={label} label={label} index={index} />
            ))}
          </div>
        </section>
      )}

      <section className="creatie-reviews-v3 grid-paper">
        <h2>{lang === "zh" ? "像素背后的反馈" : "Reviews behind the pixels"}</h2>
        <div className="review-cloud">
          <ReviewCard quote="The site finally feels like our brand." name="Client A" role="Founder" rotate={-4} />
          <ReviewCard quote="The flow became much easier to use." name="Client B" role="Product Lead" rotate={3} />
          <ReviewCard quote="Sharp design without overcomplicating it." name="Client C" role="Director" rotate={-2} />
        </div>
        <MacDock email={site.email} />
      </section>

      {sectionIsVisible("contact") && (
        <section className="creatie-contact-v3" id="contact" style={{ "--contact-bg": `url(${meadowImage})` } as CSSProperties}>
          <div className="social-bubbles">
            {site.social.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                {item.label.slice(0, 1).toUpperCase()}
              </a>
            ))}
            <a href={`mailto:${site.email}`}>@</a>
          </div>
          <GooglyEyes />
          <p className="contact-idea">— Have an idea? Let’s turn it into a sharp digital experience.</p>
          <h2 className="contact-big">LET’S BUILD SOMETHING MEMORABLE</h2>
          <a className="chat-button" href={`mailto:${site.email}`}>
            {lang === "zh" ? "聊聊项目" : "Let’s chat"}
          </a>
          <MacDock email={site.email} />
        </section>
      )}
    </main>
  );
}
