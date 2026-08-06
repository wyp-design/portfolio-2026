"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import type { EducationItem, Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";
import { SiteHeader } from "./site-header";

const folderColors = ["#b9ff55", "#ff756b", "#8780ff", "#ffd84a", "#4ed0e9", "#a579ff"];
const tags = ["UI/UX", "AI Design", "Product System", "Web / App", "Visual"];

function isPdf(media?: UploadedMedia) {
  return media?.mimeType === "application/pdf";
}

function isVideo(media?: UploadedMedia) {
  return Boolean(media?.mimeType?.startsWith("video/"));
}

function allMedia(project: Project) {
  return project.sections.flatMap((section) => section.media || []);
}

function previewMedia(project: Project) {
  return allMedia(project).filter((media) => !isPdf(media)).slice(0, 3);
}

function splitParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function educationVisible(item?: EducationItem) {
  if (!item) return false;
  return Boolean(item.school.zh || item.school.en || item.degree.zh || item.degree.en || item.time.zh || item.time.en);
}

function SectionLabel({ children }: { children: string }) {
  return <p className="creatie-section-label">{children}</p>;
}

function ProjectFolderCard({
  project,
  index,
  title,
  summary,
}: {
  project: Project;
  index: number;
  title: string;
  summary: string;
}) {
  const assetPath = useAssetPath();
  const previews = previewMedia(project);
  const color = project.accent || folderColors[index % folderColors.length];
  const count = allMedia(project).length;

  return (
    <Link className="creatie-folder-card" href={`/projects/${project.slug}`} style={{ "--folder": color } as CSSProperties}>
      <div className="creatie-folder-art" aria-hidden="true">
        <span className="creatie-folder-back" />
        <span className="creatie-folder-pocket" />
        <div className="creatie-folder-stack">
          {[0, 1, 2].map((slot) => {
            const media = previews[slot];
            return (
              <span className={`creatie-folder-sheet sheet-${slot + 1}`} key={slot}>
                {media ? (
                  isVideo(media) ? (
                    <video src={assetPath(media.url)} muted playsInline preload="metadata" />
                  ) : (
                    <ResilientImage
                      src={media.thumbnailUrl || media.url}
                      fallbackSrc={media.url}
                      alt=""
                      loading={index < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  )
                ) : (
                  <b>{title}</b>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <span className="creatie-folder-index">{String(index + 1).padStart(2, "0")}</span>
      <h3>{title}</h3>
      <p>{count ? `${count} 个素材` : summary}</p>
    </Link>
  );
}

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const { language, t } = useLanguage();
  const assetPath = useAssetPath();
  const [activeExperience, setActiveExperience] = useState<number | null>(null);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const orderedSections = [...site.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const visible = (id: string) => orderedSections.some((section) => section.id === id);
  const label = (id: string, fallback: string) => {
    const index = orderedSections.findIndex((section) => section.id === id);
    const section = orderedSections[index];
    return `${String(index + 1).padStart(2, "0")} — ${section ? t(section.label) : fallback}`;
  };
  const bioBlocks = splitParagraphs(t(site.bio));
  const education = [site.education, site.education2].filter(educationVisible) as EducationItem[];
  const active = activeExperience === null ? null : site.experiences[activeExperience];

  useEffect(() => {
    document.body.classList.toggle("is-modal-open", activeExperience !== null || portraitOpen);
    return () => document.body.classList.remove("is-modal-open");
  }, [activeExperience, portraitOpen]);

  const heroTitle = useMemo(() => {
    const line1 = t(site.heroTitle.line1) || "让复杂变清晰";
    const line2 = t(site.heroTitle.line2) || "让体验有感觉";
    return `${line1} ${line2}`;
  }, [site.heroTitle.line1, site.heroTitle.line2, t]);

  return (
    <main className="creatie-site">
      {visible("hero") && (
        <section className="creatie-hero" id="top">
          <SiteHeader name={site.name} />
          <div className="creatie-sky" />
          <span className="creatie-cloud cloud-a" />
          <span className="creatie-cloud cloud-b" />
          <span className="creatie-cloud cloud-c" />
          <span className="creatie-orb orb-a">UI</span>
          <span className="creatie-orb orb-b">AI</span>
          <span className="creatie-orb orb-c">UX</span>
          <div className="creatie-hero-inner">
            <div className="creatie-profile-pill">
              {site.aboutPhoto?.url ? (
                <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} />
              ) : (
                <span>{site.name.slice(0, 1)}</span>
              )}
              <div>
                <strong>{site.name}</strong>
                <small>{t(site.shortRole)}</small>
              </div>
              <em>Available for work</em>
            </div>
            <p className="creatie-hero-kicker">{t(site.location)} · Portfolio 2026</p>
            <h1 className="creatie-hero-title">{heroTitle}</h1>
            <p className="creatie-hero-copy">{t(site.intro)}</p>
            <div className="creatie-tags">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <Link className="creatie-hero-cta" href="#work">
              查看精选作品
              <span>↗</span>
            </Link>
          </div>
          <div className="creatie-hill" />
        </section>
      )}

      {visible("about") && (
        <section className="creatie-about" id="about">
          <SectionLabel>{label("about", language === "zh" ? "关于我" : "About")}</SectionLabel>
          <div className="creatie-about-card">
            <button className="creatie-avatar" type="button" onClick={() => setPortraitOpen(true)} aria-label="放大头像">
              {site.aboutPhoto?.url ? (
                <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} />
              ) : (
                <span>{site.name.slice(0, 1)}</span>
              )}
            </button>
            <div className="creatie-about-head">
              <h2>{site.name}</h2>
              <p>{t(site.shortRole)}</p>
              <div className="creatie-contact-mini">
                {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </div>
            </div>
          </div>
          <div className="creatie-about-copy">
            {bioBlocks.map((block) => (
              <p key={block}>{block}</p>
            ))}
          </div>
          {education.length > 0 && (
            <div className="creatie-education">
              {education.map((item, index) => (
                <article key={`${t(item.school)}-${index}`}>
                  <small>EDU {String(index + 1).padStart(2, "0")}</small>
                  <h3>{t(item.school)}</h3>
                  <p>
                    {t(item.degree)}
                    {t(item.time) ? ` · ${t(item.time)}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
          <div className="creatie-experience-grid">
            {site.experiences.map((item, index) => (
              <button key={`${t(item.company)}-${index}`} type="button" onClick={() => setActiveExperience(index)}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <h3>{t(item.company)}</h3>
                <p>
                  {t(item.position)} · {t(item.time)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {visible("manifesto") && (
        <section className="creatie-manifesto">
          <SectionLabel>{label("manifesto", language === "zh" ? "设计宣言" : "Manifesto")}</SectionLabel>
          <h2>
            {t(site.manifestoLine1)}
            <br />
            {t(site.manifestoLine2)}
          </h2>
          <p>{t(site.manifestoIntro)}</p>
          <div className="creatie-stat-row">
            <span>9+ years</span>
            <span>AI / UX</span>
            <span>Web / App</span>
            <span>Design System</span>
          </div>
        </section>
      )}

      {visible("work") && (
        <section className="creatie-work" id="work">
          <div className="creatie-section-head">
            <SectionLabel>{label("work", language === "zh" ? "精选作品" : "Work")}</SectionLabel>
            <p>{t(site.workIntro)}</p>
          </div>
          <div className="creatie-folder-grid">
            {projects.map((project, index) => (
              <ProjectFolderCard
                key={project.slug}
                project={project}
                index={index}
                title={t(project.title)}
                summary={t(project.summary)}
              />
            ))}
          </div>
        </section>
      )}

      {visible("contact") && (
        <section className="creatie-contact" id="contact">
          <SectionLabel>{label("contact", language === "zh" ? "联系我" : "Contact")}</SectionLabel>
          <h2>{t(site.contactHeadline) || "有意思的东西。"}</h2>
          <div className="creatie-contact-links">
            <a href={`mailto:${site.email}`}>{site.email} ↗</a>
            {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
            {site.social.map((item) => (
              <a href={item.href} key={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {portraitOpen && site.aboutPhoto?.url && (
        <div className="creatie-modal" role="dialog" aria-modal="true" onClick={() => setPortraitOpen(false)}>
          <button className="creatie-modal-close" type="button" aria-label="关闭" onClick={() => setPortraitOpen(false)}>
            ×
          </button>
          <ResilientImage
            className="creatie-portrait-large"
            src={assetPath(site.aboutPhoto.url)}
            fallbackSrc={site.aboutPhoto.url}
            alt={site.name}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {active && (
        <div className="creatie-modal" role="dialog" aria-modal="true" onClick={() => setActiveExperience(null)}>
          <article className="creatie-experience-modal" onClick={(event) => event.stopPropagation()}>
            <button className="creatie-modal-close" type="button" aria-label="关闭" onClick={() => setActiveExperience(null)}>
              ×
            </button>
            <small>{t(active.time)}</small>
            <h2>{t(active.company)}</h2>
            <h3>{t(active.position)}</h3>
            {splitParagraphs(t(active.description)).map((block) => (
              <p key={block}>{block}</p>
            ))}
            {active.link && (
              <a href={active.link} target="_blank" rel="noreferrer">
                项目链接 ↗
              </a>
            )}
          </article>
        </div>
      )}
    </main>
  );
}
