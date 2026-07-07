"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LocalizedText, Project, SiteContent, UploadedMedia } from "@/content/types";
import { optimizedAssetPath } from "@/lib/paths";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";
import { SiteHeader } from "./site-header";

type ProjectSection = Project["sections"][number];

function isPdf(media: UploadedMedia) {
  return media.mimeType === "application/pdf";
}

function isVideo(media: UploadedMedia) {
  return Boolean(media.mimeType?.startsWith("video/"));
}

function firstMedia(section: ProjectSection) {
  return section.media?.[0];
}

function SectionIndexCard({
  section,
  index,
  active,
  t,
  onSelect,
}: {
  section: ProjectSection;
  index: number;
  active: boolean;
  t: (value: LocalizedText) => string;
  onSelect: () => void;
}) {
  const assetPath = useAssetPath();
  const cover = firstMedia(section);
  const title = t(section.title);
  const summary = t(section.body);

  return (
    <button
      className={`case-section-index-card ${active ? "is-active" : ""}`}
      type="button"
      onClick={onSelect}
      aria-label={`Open ${title}`}
    >
      {cover ? (
        isPdf(cover) ? (
          <span className="case-section-index-file">PDF</span>
        ) : isVideo(cover) ? (
          <video src={assetPath(cover.url)} muted playsInline preload="metadata" />
        ) : (
          <ResilientImage
            src={optimizedAssetPath(cover.thumbnailUrl || cover.url, 900, 76)}
            fallbackSrc={cover.thumbnailUrl || cover.url}
            alt={cover.alt ? t(cover.alt) : title}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
          />
        )
      ) : (
        <span className="case-section-index-file">{title}</span>
      )}
      <span className="case-section-index-shade" />
      <span className="case-section-index-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="case-section-index-plus">+</span>
      <div>
        <span>{t(section.eyebrow)}</span>
        <strong>{title}</strong>
        <p>{summary}</p>
      </div>
    </button>
  );
}

function GalleryMediaCard({
  media,
  title,
  caption,
  index,
  onOpen,
}: {
  media: UploadedMedia;
  title: string;
  caption: string;
  index: number;
  onOpen: () => void;
}) {
  const assetPath = useAssetPath();
  const label = title || media.originalFilename || `File ${index + 1}`;

  return (
    <button
      className={`case-gallery-card ${index % 5 === 0 || index % 5 === 3 ? "is-portrait" : "is-landscape"}`}
      type="button"
      onClick={onOpen}
      aria-label={`Open ${label}`}
    >
      {isPdf(media) ? (
        <span className="case-gallery-file">PDF</span>
      ) : isVideo(media) ? (
        <video src={assetPath(media.url)} muted playsInline preload="metadata" />
      ) : (
        <ResilientImage
          src={optimizedAssetPath(media.thumbnailUrl || media.url, 700, 76)}
          fallbackSrc={media.thumbnailUrl || media.url}
          alt={caption || label}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      <span className="case-gallery-shade" />
      <span className="case-gallery-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="case-gallery-plus">+</span>
      <strong>{label}</strong>
    </button>
  );
}

export function ProjectPage({
  project,
  nextProject,
  site,
}: {
  project: Project;
  nextProject?: Project;
  site: SiteContent;
}) {
  const assetPath = useAssetPath();
  const { language, t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const mediaWallRef = useRef<HTMLElement>(null);
  const modalScrollRef = useRef<HTMLElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<UploadedMedia | null>(null);
  const [mediaZoom, setMediaZoom] = useState(1);

  const activeSection = activeSectionIndex === null ? null : project.sections[activeSectionIndex] || null;
  const activeSectionMedia = activeSection?.media || [];
  const allProjectMedia = useMemo(
    () => project.sections.flatMap((section) => section.media || []),
    [project.sections],
  );
  const lightboxPool = activeSectionMedia.length ? activeSectionMedia : allProjectMedia;
  const activeMediaIndex = lightboxMedia
    ? Math.max(0, lightboxPool.findIndex((item) => item === lightboxMedia || item.url === lightboxMedia.url))
    : -1;

  const categoryLine = [t(project.category), project.year].filter(Boolean).join(" / ");

  const selectSection = useCallback((index: number) => {
    setActiveSectionIndex(index);
    setLightboxMedia(null);
    requestAnimationFrame(() => {
      mediaWallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const navigateMedia = useCallback((direction: -1 | 1) => {
    if (!lightboxMedia || lightboxPool.length < 2) return;
    const nextIndex = (activeMediaIndex + direction + lightboxPool.length) % lightboxPool.length;
    setLightboxMedia(lightboxPool[nextIndex]);
    setMediaZoom(1);
    requestAnimationFrame(() => modalScrollRef.current?.scrollTo({ top: 0, left: 0 }));
  }, [activeMediaIndex, lightboxMedia, lightboxPool]);

  useEffect(() => {
    setActiveSectionIndex(null);
    setLightboxMedia(null);
  }, [project.slug]);

  useEffect(() => {
    if (!lightboxMedia) return;
    setMediaZoom(1);
    const modal = modalScrollRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxMedia(null);
      if (event.key === "ArrowLeft") navigateMedia(-1);
      if (event.key === "ArrowRight") navigateMedia(1);
      if (!isPdf(lightboxMedia) && !isVideo(lightboxMedia)) {
        if (event.key === "+" || event.key === "=") setMediaZoom((current) => Math.min(2.5, current + 0.25));
        if (event.key === "-") setMediaZoom((current) => Math.max(0.5, current - 0.25));
        if (event.key === "0") setMediaZoom(1);
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (!modal) return;
      event.preventDefault();
      event.stopPropagation();
      modal.scrollTop += event.deltaY;
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    modal?.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      modal?.removeEventListener("wheel", onWheel);
    };
  }, [lightboxMedia, navigateMedia]);

  return (
    <main className="case-page case-page-directory" ref={root}>
      <section className="case-category-landing">
        <SiteHeader name={site.name} />
        <div className="case-category-shell">
          <Link className="back-link" href="/#work">&lt; All work</Link>
          <div className="case-category-intro">
            <span>{categoryLine || "Project category"}</span>
            <h1>{t(project.title)}</h1>
            <p>{t(project.summary)}</p>
            <div className="case-category-meta">
              <span>{t(project.role)}</span>
              <span>{t(project.category)}</span>
              {project.year ? <span>{project.year}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="case-section-index case-section-index-directory">
        <div className="case-project-media-heading">
          <span>{language === "zh" ? "PROJECT LIST" : "PROJECT LIST"}</span>
          <h2>{t(project.title)}</h2>
          <p>{t(project.summary)}</p>
        </div>
        <div className="case-section-index-grid">
          {project.sections.map((section, index) => (
            <SectionIndexCard
              section={section}
              index={index}
              active={activeSectionIndex === index}
              t={t}
              onSelect={() => selectSection(index)}
              key={`${section.title.en}-${index}`}
            />
          ))}
        </div>
      </section>

      {activeSection ? (
        <section className={`case-project-media-wall ${activeSectionMedia.length ? "" : "is-empty"}`} ref={mediaWallRef}>
          <div className="case-project-media-heading">
            <span>{String((activeSectionIndex || 0) + 1).padStart(2, "0")} / {t(activeSection.eyebrow)}</span>
            <h2>{t(activeSection.title)}</h2>
            <p>{t(activeSection.body)}</p>
          </div>
          {activeSectionMedia.length ? (
            <div className="case-square-gallery">
              {activeSectionMedia.map((item, index) => (
                <GalleryMediaCard
                  media={item}
                  title={item.title ? t(item.title) : ""}
                  caption={item.caption ? t(item.caption) : ""}
                  index={index}
                  onOpen={() => setLightboxMedia(item)}
                  key={`${item.url}-${index}`}
                />
              ))}
            </div>
          ) : (
            <div className="case-placeholder">
              <span>No files in this project yet.</span>
              <div style={{ background: project.accent }} />
            </div>
          )}
        </section>
      ) : null}

      {nextProject ? (
        <Link className="next-project" href={`/projects/${nextProject.slug}`}>
          <span>Next category</span>
          <h2>{t(nextProject.title)} -&gt;</h2>
        </Link>
      ) : null}

      {lightboxMedia ? (
        <div className="case-work-modal" role="dialog" aria-modal="true" aria-label={lightboxMedia.originalFilename || "Project media"}>
          <button className="case-work-modal-backdrop" type="button" onClick={() => setLightboxMedia(null)} aria-label="Close" />
          {lightboxPool.length > 1 ? (
            <button className="case-work-modal-nav is-prev" type="button" onClick={() => navigateMedia(-1)} aria-label="Previous file">&lt;</button>
          ) : null}
          <article
            className="case-work-modal-card case-work-modal-browser"
            ref={modalScrollRef}
            onTouchStart={(event) => { touchStartXRef.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              const startX = touchStartXRef.current;
              const endX = event.changedTouches[0]?.clientX;
              touchStartXRef.current = null;
              if (startX == null || endX == null || Math.abs(endX - startX) < 55) return;
              navigateMedia(endX < startX ? 1 : -1);
            }}
          >
            <button className="case-work-modal-close" type="button" onClick={() => setLightboxMedia(null)} aria-label="Close">x</button>
            <div className="case-work-modal-media">
              {!isPdf(lightboxMedia) && !isVideo(lightboxMedia) ? (
                <div className="case-work-modal-toolbar" aria-label="Image zoom controls">
                  <button type="button" onClick={() => setMediaZoom((current) => Math.max(0.5, current - 0.25))} disabled={mediaZoom <= 0.5} aria-label="Zoom out">-</button>
                  <span>{Math.round(mediaZoom * 100)}%</span>
                  <button type="button" onClick={() => setMediaZoom((current) => Math.min(2.5, current + 0.25))} disabled={mediaZoom >= 2.5} aria-label="Zoom in">+</button>
                  <button type="button" className="case-work-modal-fit" onClick={() => setMediaZoom(1)}>Fit width</button>
                  <a href={assetPath(lightboxMedia.url)} target="_blank" rel="noreferrer">Original -&gt;</a>
                </div>
              ) : null}
              {isPdf(lightboxMedia) ? (
                <iframe src={assetPath(lightboxMedia.url)} title={lightboxMedia.originalFilename || "PDF preview"} loading="lazy" />
              ) : isVideo(lightboxMedia) ? (
                <video src={assetPath(lightboxMedia.url)} controls playsInline autoPlay />
              ) : (
                <div className="case-work-modal-image-canvas">
                  <ResilientImage
                    src={lightboxMedia.url}
                    alt={lightboxMedia.originalFilename || "Project media"}
                    decoding="async"
                    style={{ width: `${mediaZoom * 100}%` }}
                  />
                </div>
              )}
            </div>
          </article>
          {lightboxPool.length > 1 ? (
            <>
              <button className="case-work-modal-nav is-next" type="button" onClick={() => navigateMedia(1)} aria-label="Next file">&gt;</button>
              <span className="case-work-modal-count">{activeMediaIndex + 1} / {lightboxPool.length}</span>
            </>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
