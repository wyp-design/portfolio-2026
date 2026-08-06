"use client";

import Link from "next/link";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import type { LocalizedText, Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { ResilientImage } from "./resilient-image";
import { SiteHeader } from "./site-header";

type ProjectSection = Project["sections"][number];

function isPdf(media?: UploadedMedia) {
  return media?.mimeType === "application/pdf";
}

function isVideo(media?: UploadedMedia) {
  return Boolean(media?.mimeType?.startsWith("video/"));
}

function sectionCover(section: ProjectSection) {
  return section.media?.find((media) => !isPdf(media)) || section.media?.[0];
}

function text(value: LocalizedText | undefined, t: (value: LocalizedText) => string, fallback = "") {
  return value ? t(value) || fallback : fallback;
}

function ProjectIndexCard({
  section,
  index,
  onSelect,
  t,
}: {
  section: ProjectSection;
  index: number;
  onSelect: () => void;
  t: (value: LocalizedText) => string;
}) {
  const assetPath = useAssetPath();
  const cover = sectionCover(section);
  const title = text(section.title, t, `Project ${index + 1}`);
  const count = section.media?.length || 0;

  return (
    <button className="creatie-case-card" type="button" onClick={onSelect}>
      <div className="creatie-case-card-media">
        {cover ? (
          isPdf(cover) ? (
            <span>PDF</span>
          ) : isVideo(cover) ? (
            <video src={assetPath(cover.url)} muted playsInline preload="metadata" />
          ) : (
            <ResilientImage
              src={cover.thumbnailUrl || cover.url}
              fallbackSrc={cover.url}
              alt={cover.alt ? t(cover.alt) : title}
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
            />
          )
        ) : (
          <span>{title}</span>
        )}
      </div>
      <small>{String(index + 1).padStart(2, "0")}</small>
      <h3>{title}</h3>
      <p>{count} 个素材</p>
    </button>
  );
}

function MediaTile({
  media,
  index,
  title,
  onOpen,
}: {
  media: UploadedMedia;
  index: number;
  title: string;
  onOpen: () => void;
}) {
  const assetPath = useAssetPath();
  const label = title || media.originalFilename || `File ${index + 1}`;

  return (
    <button className="creatie-masonry-tile" type="button" onClick={onOpen} aria-label={`打开 ${label}`}>
      {isPdf(media) ? (
        <span className="creatie-file-badge">PDF</span>
      ) : isVideo(media) ? (
        <video src={assetPath(media.url)} muted playsInline preload="metadata" />
      ) : (
        <ResilientImage
          src={media.thumbnailUrl || media.url}
          fallbackSrc={media.url}
          alt={media.alt?.zh || label}
          loading={index < 8 ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      <span className="creatie-media-shade" />
      <small>{String(index + 1).padStart(2, "0")}</small>
      <strong>{label}</strong>
      <em>+</em>
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
  const { language, t } = useLanguage();
  const assetPath = useAssetPath();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeSection = project.sections[activeSectionIndex] || project.sections[0];
  const media = activeSection?.media || [];
  const activeMedia = lightboxIndex === null ? null : media[lightboxIndex];
  const projectTitle = t(project.title);
  const sectionTitle = activeSection ? t(activeSection.title) : projectTitle;
  const sectionBody = activeSection ? t(activeSection.body) : t(project.summary);

  const next = () => setLightboxIndex((current) => (current === null ? 0 : (current + 1) % media.length));
  const prev = () => setLightboxIndex((current) => (current === null ? 0 : (current - 1 + media.length) % media.length));

  useEffect(() => {
    document.body.classList.toggle("is-modal-open", lightboxIndex !== null);
    return () => document.body.classList.remove("is-modal-open");
  }, [lightboxIndex]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, media.length]);

  const sectionCards = useMemo(
    () => project.sections.map((section, index) => ({ section, index, title: text(section.title, t, `Project ${index + 1}`) })),
    [project.sections, t],
  );

  return (
    <main className="creatie-case-page">
      <SiteHeader name={site.name} />
      <section className="creatie-case-hero">
        <Link className="creatie-back" href="/#work">
          ← {language === "zh" ? "全部作品" : "All work"}
        </Link>
        <div>
          <p>
            {t(project.category)} · {project.year || "2026"}
          </p>
          <h1>{projectTitle}</h1>
          <span>{t(project.summary)}</span>
        </div>
      </section>

      <section className="creatie-project-index">
        <div className="creatie-index-head">
          <small>PROJECT LIST</small>
          <h2>{projectTitle}</h2>
          <p>{t(project.summary)}</p>
        </div>
        <div className="creatie-case-card-grid">
          {sectionCards.map(({ section, index }) => (
            <ProjectIndexCard
              key={`${text(section.title, t)}-${index}`}
              section={section}
              index={index}
              t={t}
              onSelect={() => {
                setActiveSectionIndex(index);
                document.getElementById("case-detail")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          ))}
        </div>
      </section>

      <section className="creatie-case-detail" id="case-detail">
        <button className="creatie-back-button" type="button" onClick={() => document.querySelector(".creatie-project-index")?.scrollIntoView({ behavior: "smooth" })}>
          ← {language === "zh" ? "返回项目列表" : "Back to projects"}
        </button>
        <div className="creatie-detail-head">
          <small>{String(activeSectionIndex + 1).padStart(2, "0")} / {language === "zh" ? "项目" : "Project"}</small>
          <h2 style={{ textAlign: activeSection?.titleAlign || "left" } as CSSProperties}>{sectionTitle}</h2>
          <p style={{ textAlign: activeSection?.bodyAlign || "left" } as CSSProperties}>{sectionBody}</p>
        </div>
        {media.length ? (
          <div className="creatie-masonry">
            {media.map((item, index) => (
              <MediaTile
                key={`${item.url}-${index}`}
                media={item}
                index={index}
                title={text(item.title, t, item.originalFilename || `File ${index + 1}`)}
                onOpen={() => setLightboxIndex(index)}
              />
            ))}
          </div>
        ) : (
          <p className="creatie-empty">{language === "zh" ? "这个项目还没有上传素材。" : "No media uploaded yet."}</p>
        )}
      </section>

      {nextProject && (
        <section className="creatie-next">
          <small>{language === "zh" ? "下一个分类" : "Next category"}</small>
          <Link href={`/projects/${nextProject.slug}`}>{t(nextProject.title)} →</Link>
        </section>
      )}

      {activeMedia && (
        <div className="creatie-lightbox" role="dialog" aria-modal="true">
          <button className="creatie-lightbox-close" type="button" aria-label="关闭" onClick={() => setLightboxIndex(null)}>
            ×
          </button>
          {media.length > 1 && (
            <>
              <button className="creatie-lightbox-nav prev" type="button" onClick={prev} aria-label="上一张">
                ‹
              </button>
              <button className="creatie-lightbox-nav next" type="button" onClick={next} aria-label="下一张">
                ›
              </button>
            </>
          )}
          <article className="creatie-lightbox-card">
            <header>
              <small>{String((lightboxIndex || 0) + 1).padStart(2, "0")} / {media.length}</small>
              <h2>{text(activeMedia.title, t, activeMedia.originalFilename || sectionTitle)}</h2>
              {activeMedia.caption && <p>{t(activeMedia.caption)}</p>}
            </header>
            <div className="creatie-lightbox-viewer">
              {isPdf(activeMedia) ? (
                <iframe title={activeMedia.originalFilename || "PDF"} src={assetPath(activeMedia.url)} />
              ) : isVideo(activeMedia) ? (
                <video src={assetPath(activeMedia.url)} controls playsInline />
              ) : (
                <ResilientImage src={activeMedia.url} fallbackSrc={activeMedia.url} alt={text(activeMedia.alt, t, "")} />
              )}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
