"use client";

import Link from "next/link";
import { type CSSProperties, useMemo } from "react";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { useAssetPath } from "@/lib/use-asset-path";
import { looksGarbled, useLanguage } from "@/lib/i18n";
import { ResilientImage } from "./resilient-image";

const folderColors = ["#8bf34f", "#ff6f66", "#7b78ff", "#ffd54a", "#45c9e8", "#9b70ff"];

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

function previewMedia(project: Project) {
  return allMedia(project).filter((media) => !isPdf(media)).slice(0, 3);
}

function FolderCard({ project, index }: { project: Project; index: number }) {
  const { t } = useLanguage();
  const assetPath = useAssetPath();
  const title = safeText(t(project.title), `Project ${index + 1}`);
  const count = allMedia(project).length;
  const previews = previewMedia(project);
  const color = project.accent || folderColors[index % folderColors.length];

  return (
    <Link className="creatie-v2-folder" href={`/projects/${project.slug}`} style={{ "--folder-color": color } as CSSProperties}>
      <div className="creatie-v2-folder-art" aria-hidden="true">
        <span className="creatie-v2-folder-back" />
        <span className="creatie-v2-folder-pocket" />
        <div className="creatie-v2-sheets">
          {[0, 1, 2].map((slot) => {
            const media = previews[slot];
            return (
              <span className={`creatie-v2-sheet sheet-${slot + 1}`} key={slot}>
                {media ? (
                  isVideo(media) ? (
                    <video src={assetPath(media.url)} muted playsInline preload="metadata" />
                  ) : (
                    <ResilientImage src={media.thumbnailUrl || media.url} fallbackSrc={media.url} alt="" loading={index < 3 ? "eager" : "lazy"} decoding="async" />
                  )
                ) : (
                  <b>{title}</b>
                )}
              </span>
            );
          })}
        </div>
      </div>
      <small>{String(index + 1).padStart(2, "0")}</small>
      <h3>{title}</h3>
      <p>{count || 1} 个素材</p>
    </Link>
  );
}

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const { language, setLanguage } = useLanguage();
  const assetPath = useAssetPath();
  const heroPreview = useMemo(() => previewMedia(projects[0] || ({} as Project))[0], [projects]);
  const avatar = site.aboutPhoto;

  return (
    <main className="creatie-v2">
      <header className="creatie-v2-nav">
        <Link href="/" className="creatie-v2-logo">CREATIE®</Link>
        <nav>
          <a href="#work">WORK</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
          <button type="button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>{language === "zh" ? "EN" : "中"}</button>
        </nav>
      </header>

      <section className="creatie-v2-hero">
        <div className="creatie-v2-sky">
          <span className="cloud cloud-1" />
          <span className="cloud cloud-2" />
          <span className="hill hill-1" />
          <span className="hill hill-2" />
          <span className="hill hill-3" />
        </div>

        <div className="creatie-v2-profile">
          {avatar?.url ? <ResilientImage src={avatar.thumbnailUrl || avatar.url} fallbackSrc={avatar.url} alt={site.name} /> : <span>{site.name.slice(0, 1)}</span>}
          <div>
            <strong>{site.name || "SARAH"}</strong>
            <small>{language === "zh" ? "产品设计师" : "PRODUCT DESIGNER"}</small>
          </div>
          <em>Available for work</em>
        </div>

        <div className="creatie-v2-float-tag tag-ui">UI/UX Design</div>
        <div className="creatie-v2-float-tag tag-ill">Illustration</div>
        <div className="creatie-v2-float-tag tag-3d">3D Design</div>

        <div className="creatie-v2-hero-copy">
          <h1>
            DESIGN THAT
            <br />
            MAKES PEOPLE
            <br />
            LOOK TWICE
          </h1>
        </div>

        <p className="creatie-v2-caption">— Not just visuals, I make digital things look alive</p>

        <div className="creatie-v2-dock" aria-label="Quick links">
          {["📁", "🎨", "🙂", "✉️"].map((icon, index) => (
            <a key={index} href={index === 3 ? `mailto:${site.email}` : "#work"}>{icon}</a>
          ))}
        </div>

        <Link className="creatie-v2-mini-card" href={projects[0] ? `/projects/${projects[0].slug}` : "#work"}>
          {heroPreview && !isVideo(heroPreview) ? (
            <ResilientImage src={heroPreview.thumbnailUrl || heroPreview.url} fallbackSrc={heroPreview.url} alt="" />
          ) : (
            <span>CASE</span>
          )}
          <div>
            <small>2026</small>
            <strong>{projects[0] ? safeText(language === "zh" ? projects[0].title.zh : projects[0].title.en, "WAYXWAY") : "WAYXWAY"}</strong>
            <em>VIEW CASE STUDY</em>
          </div>
        </Link>
      </section>

      <section className="creatie-v2-about" id="about">
        <div className="creatie-v2-about-card">
          <div className="avatar-large">
            {avatar?.url ? <ResilientImage src={avatar.thumbnailUrl || avatar.url} fallbackSrc={avatar.url} alt={site.name} /> : <span>{site.name.slice(0, 1)}</span>}
          </div>
          <div>
            <h2>{site.name || "Penn.W"}</h2>
            <p>{language === "zh" ? "UI/UX / AI 产品设计师" : "UI/UX / AI Product Designer"}</p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
          </div>
        </div>
        <p className="creatie-v2-about-copy">
          Creativity is the actual skill. Tech is just the tool. I design smooth, interactive interfaces, connect product logic with visual systems, and turn complex experiences into clear, memorable digital products.
        </p>
      </section>

      <section className="creatie-v2-work" id="work">
        <div className="creatie-v2-section-head">
          <span>04 — WORK</span>
          <p>Folders, case cards, experiments and visual systems.</p>
        </div>
        <div className="creatie-v2-folder-grid">
          {projects.map((project, index) => (
            <FolderCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="creatie-v2-contact" id="contact">
        <small>05 — CONTACT</small>
        <h2>LET'S MAKE SOMETHING MEMORABLE.</h2>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        {site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}
      </section>
    </main>
  );
}
