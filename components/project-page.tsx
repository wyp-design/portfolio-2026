"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { looksGarbled, useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";

type ProjectSection = Project["sections"][number];

function safe(value: string | undefined, fallback: string) {
  if (!value || looksGarbled(value)) return fallback;
  return value;
}

function isPdf(media?: UploadedMedia) {
  return media?.mimeType === "application/pdf";
}

function isVideo(media?: UploadedMedia) {
  return Boolean(media?.mimeType?.startsWith("video/"));
}

function sectionCover(section: ProjectSection) {
  return section.media?.find((media) => !isPdf(media)) || section.media?.[0];
}

function MediaPreview({ media, title }: { media?: UploadedMedia; title: string }) {
  const assetPath = useAssetPath();
  if (!media) return <span>{title}</span>;
  if (isPdf(media)) return <span>PDF</span>;
  if (isVideo(media)) return <video src={assetPath(media.url)} muted playsInline preload="metadata" />;
  return <ResilientImage src={media.thumbnailUrl || media.url} fallbackSrc={media.url} alt={title} loading="lazy" decoding="async" />;
}

export function ProjectPage({ project, nextProject, site }: { project: Project; nextProject?: Project; site: SiteContent }) {
  const { language, t } = useLanguage();
  const assetPath = useAssetPath();
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const title = safe(t(project.title), language === "zh" ? "项目分类" : "Project category");
  const summary = safe(t(project.summary), language === "zh" ? "项目说明" : "Project overview");
  const activeSection = activeSectionIndex === null ? null : project.sections[activeSectionIndex];
  const media = activeSection?.media || [];
  const activeMedia = lightboxIndex === null ? null : media[lightboxIndex];

  const sectionCards = useMemo(
    () =>
      project.sections.map((section, index) => ({
        section,
        index,
        title: safe(t(section.title), `${language === "zh" ? "项目" : "Project"} ${index + 1}`),
        body: safe(t(section.body), ""),
        cover: sectionCover(section),
      })),
    [language, project.sections, t],
  );

  useEffect(() => {
    document.body.classList.toggle("is-modal-open", lightboxIndex !== null);
    return () => document.body.classList.remove("is-modal-open");
  }, [lightboxIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex((lightboxIndex + 1) % media.length);
      if (event.key === "ArrowLeft") setLightboxIndex((lightboxIndex - 1 + media.length) % media.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, media.length]);

  return (
    <main className="creatie-v2 case">
      <header className="creatie-v2-nav">
        <Link href="/" className="creatie-v2-logo">CREATIE®</Link>
        <nav>
          <Link href="/#work">WORK</Link>
          <Link href="/#about">ABOUT</Link>
          <a href={`mailto:${site.email}`}>CONTACT</a>
        </nav>
      </header>

      <section className="case-v2-hero">
        <Link href="/#work" className="case-v2-back">‹ All work</Link>
        <div>
          <small>{safe(t(project.category), "Design")} · {project.year || "2026"}</small>
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
      </section>

      {activeSectionIndex === null ? (
        <section className="case-v2-project-list">
          <div className="case-v2-head">
            <small>PROJECT LIST</small>
            <h2>{title}</h2>
            <p>{summary}</p>
          </div>
          <div className="case-v2-card-grid">
            {sectionCards.map((card) => (
              <button key={`${card.index}-${card.title}`} type="button" className="case-v2-card" onClick={() => setActiveSectionIndex(card.index)}>
                <div className="case-v2-card-media">
                  <MediaPreview media={card.cover} title={card.title} />
                  <i>+</i>
                </div>
                <small>{String(card.index + 1).padStart(2, "0")}</small>
                <h3>{card.title}</h3>
                <p>{card.section.media?.length || 0} files</p>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="case-v2-detail">
          <button type="button" className="case-v2-back-button" onClick={() => setActiveSectionIndex(null)}>
            ← Back to project list
          </button>
          <div className="case-v2-detail-head">
            <small>{String(activeSectionIndex + 1).padStart(2, "0")} / PROJECT</small>
            <h2>{safe(t(activeSection?.title || project.title), title)}</h2>
            <p>{safe(t(activeSection?.body || project.summary), summary)}</p>
          </div>
          {media.length ? (
            <div className="case-v2-masonry">
              {media.map((item, index) => {
                const mediaTitle = safe(t(item.title || { zh: "", en: "" }), item.originalFilename || `File ${index + 1}`);
                return (
                  <button className="case-v2-masonry-item" key={`${item.url}-${index}`} type="button" onClick={() => setLightboxIndex(index)}>
                    <MediaPreview media={item} title={mediaTitle} />
                    <span />
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <strong>{mediaTitle}</strong>
                    <i>+</i>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="case-v2-empty">No files uploaded yet.</p>
          )}
        </section>
      )}

      {nextProject && activeSectionIndex === null && (
        <Link className="case-v2-next" href={`/projects/${nextProject.slug}`}>
          <small>Next category</small>
          <strong>{safe(t(nextProject.title), "Next project")} →</strong>
        </Link>
      )}

      {activeMedia && lightboxIndex !== null && (
        <div className="case-v2-lightbox" role="dialog" aria-modal="true">
          <button className="close" type="button" onClick={() => setLightboxIndex(null)}>×</button>
          {media.length > 1 && (
            <>
              <button className="prev" type="button" onClick={() => setLightboxIndex((lightboxIndex - 1 + media.length) % media.length)}>‹</button>
              <button className="next" type="button" onClick={() => setLightboxIndex((lightboxIndex + 1) % media.length)}>›</button>
            </>
          )}
          <div className="case-v2-lightbox-stage">
            {isPdf(activeMedia) ? (
              <iframe src={assetPath(activeMedia.url)} title={activeMedia.originalFilename || "PDF preview"} />
            ) : isVideo(activeMedia) ? (
              <video src={assetPath(activeMedia.url)} controls playsInline />
            ) : (
              <ResilientImage src={activeMedia.url} fallbackSrc={activeMedia.thumbnailUrl || activeMedia.url} alt={activeMedia.originalFilename || "Preview"} />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
