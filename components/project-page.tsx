"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LocalizedText, Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { SiteHeader } from "./site-header";
import { ResilientImage } from "./resilient-image";
import { optimizedAssetPath } from "@/lib/paths";

type ProjectSection = Project["sections"][number];

function richClass(prefix: string, value?: "small" | "medium" | "large") {
  return `${prefix}-${value || "medium"}`;
}

function weightClass(value?: "regular" | "medium" | "bold") {
  return `rich-weight-${value || "regular"}`;
}

function alignClass(prefix: string, value?: "left" | "center" | "right") {
  return `${prefix}-${value || "left"}`;
}

function isPdf(media: UploadedMedia) {
  return media.mimeType === "application/pdf";
}

function isVideo(media: UploadedMedia) {
  return Boolean(media.mimeType?.startsWith("video/"));
}

function BodyContent({
  body,
  align,
  tableAlign,
}: {
  body: string;
  align?: "left" | "center" | "right";
  tableAlign?: "left" | "center" | "right";
}) {
  const lines = body.split("\n");
  const tableLines = lines.filter((line) => line.trim().startsWith("|") && line.trim().endsWith("|"));

  if (tableLines.length >= 2) {
    const rows = tableLines
      .filter((line) => !/^\|\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|$/.test(line.trim()))
      .map((line) =>
        line
          .trim()
          .slice(1, -1)
          .split("|")
          .map((cell) => cell.trim()),
      );

    return (
      <div className={`case-table-wrap case-table-${tableAlign || "left"}`}>
        <table>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`}>
                {row.map((cell, cellIndex) =>
                  rowIndex === 0 ? <th key={`${cell}-${cellIndex}`}>{cell}</th> : <td key={`${cell}-${cellIndex}`}>{cell}</td>,
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p className={`rich-text case-body-text text-${align || "left"}`}>{body}</p>;
}

function MediaFigure({
  media,
  caption,
  imageMode,
  onOpen,
}: {
  media: UploadedMedia;
  caption: string;
  imageMode: "grid" | "split" | "full";
  onOpen: () => void;
}) {
  const assetPath = useAssetPath();
  if (isPdf(media)) {
    return (
      <figure className="case-pdf-viewer">
        <div className="case-pdf-frame">
          <iframe src={assetPath(media.url)} title={media.originalFilename || "PDF preview"} loading="lazy" />
        </div>
        <figcaption>{caption || media.originalFilename}</figcaption>
        <a href={assetPath(media.url)} target="_blank" rel="noreferrer">打开 PDF ↗</a>
      </figure>
    );
  }

  if (isVideo(media)) {
    return (
      <figure className={`case-media-figure case-media-${imageMode}`}>
        <video src={assetPath(media.url)} controls playsInline muted preload="none" />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={`case-media-figure case-media-${imageMode}`}>
      <button type="button" className="case-image-button" onClick={onOpen} aria-label="放大查看图片">
        <ResilientImage src={media.url} alt={caption || media.originalFilename || "Project media"} loading="lazy" decoding="async" />
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
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
  return (
    <button
      className={`case-gallery-card ${index % 5 === 0 || index % 5 === 3 ? "is-portrait" : "is-landscape"}`}
      type="button"
      onClick={onOpen}
      aria-label={`打开作品 ${index + 1}`}
    >
      {isPdf(media) ? (
        <span className="case-gallery-file">PDF</span>
      ) : isVideo(media) ? (
        <video src={assetPath(media.url)} muted playsInline preload="none" />
      ) : media.mimeType === "image/gif" ? (
        <ResilientImage
          src={optimizedAssetPath(media.thumbnailUrl || media.url, 640, 75)}
          fallbackSrc={media.thumbnailUrl || media.url}
          alt={title || caption || media.originalFilename || `Project media ${index + 1}`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      ) : (
        <ResilientImage
          src={optimizedAssetPath(media.thumbnailUrl || media.url, 640, 75)}
          fallbackSrc={media.thumbnailUrl || media.url}
          alt={title || caption || media.originalFilename || `Project media ${index + 1}`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      <span className="case-gallery-shade" />
      <span className="case-gallery-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="case-gallery-plus">＋</span>
      <strong>{title || media.originalFilename || "查看作品"}</strong>
    </button>
  );
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
  const cover = section.media?.[0];
  const coverTitle = cover?.title ? t(cover.title) : t(section.title);
  const coverCaption = cover?.caption ? t(cover.caption) : t(section.body);

  return (
    <button
      className={`case-section-index-card ${active ? "is-active" : ""}`}
      type="button"
      onClick={onSelect}
      aria-label={`Open ${coverTitle}`}
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
            alt={coverTitle}
            loading={index < 4 ? "eager" : "lazy"}
            decoding="async"
          />
        )
      ) : (
        <span className="case-section-index-file">{coverTitle}</span>
      )}
      <span className="case-section-index-shade" />
      <span className="case-section-index-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="case-section-index-plus">+</span>
      <div>
        <span>{t(section.eyebrow)}</span>
        <strong>{coverTitle}</strong>
        <p>{coverCaption}</p>
      </div>
    </button>
  );
}

function SectionMedia({
  section,
  t,
  onOpen,
}: {
  section: ProjectSection;
  t: (value: LocalizedText) => string;
  onOpen: (media: UploadedMedia) => void;
}) {
  const media = section.media || [];
  if (!media.length) return null;

  const pdfs = media.filter(isPdf);
  const visualMedia = media.filter((item) => !isPdf(item));
  const sectionLayout = section.mediaLayout || "auto";

  if (sectionLayout === "square-gallery") {
    return (
      <div className="case-media-stack">
        <div className="case-square-gallery">
          {media.map((item, index) => (
            <GalleryMediaCard
              media={item}
              title={item.title ? t(item.title) : ""}
              caption={item.caption ? t(item.caption) : ""}
              index={index}
              onOpen={() => onOpen(item)}
              key={`${item.url}-${index}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="case-media-stack">
      {visualMedia.length ? (
        sectionLayout === "landscape-split" ? (
          <div className="case-media-splits">
            {visualMedia.map((item, index) => {
              const caption = item.caption ? t(item.caption) : "";
              const reverse =
                item.textPosition === "left" ||
                (section.splitPattern === "abab" && index % 2 === 1) ||
                section.splitPattern === "image-right";

              return (
                <article className={`case-split-media ${reverse ? "is-reverse" : ""}`} key={`${item.url}-${index}`}>
                  <MediaFigure media={item} caption="" imageMode="split" onOpen={() => onOpen(item)} />
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p className="rich-text">{caption || item.originalFilename || "填写图片说明 / 提示词 / 项目说明"}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={sectionLayout === "full" ? "case-media-full" : "case-media-grid"}>
            {visualMedia.map((item, index) => (
              <MediaFigure
                key={`${item.url}-${index}`}
                media={item}
                caption={item.caption ? t(item.caption) : ""}
                imageMode={sectionLayout === "full" || item.layout === "full" ? "full" : "grid"}
                onOpen={() => onOpen(item)}
              />
            ))}
          </div>
        )
      ) : null}

      {pdfs.map((item, index) => (
        <MediaFigure
          key={`${item.url}-${index}`}
          media={item}
          caption={item.caption ? t(item.caption) : ""}
          imageMode="full"
          onOpen={() => onOpen(item)}
        />
      ))}
    </div>
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
  const [lightboxMedia, setLightboxMedia] = useState<UploadedMedia | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [mediaZoom, setMediaZoom] = useState(1);
  const projectMedia = useMemo(
    () => project.sections.flatMap((section) => section.media || []),
    [project.sections],
  );
  const activeSection = activeSectionIndex === null ? null : project.sections[activeSectionIndex] || null;
  const activeSectionMedia = activeSection?.media || [];
  const lightboxPool = activeSectionMedia.length ? activeSectionMedia : projectMedia;
  const activeMediaIndex = lightboxMedia
    ? Math.max(0, lightboxPool.findIndex((item) => item === lightboxMedia || item.url === lightboxMedia.url))
    : -1;
  const navigateMedia = useCallback((direction: -1 | 1) => {
    if (!lightboxMedia || lightboxPool.length < 2) return;
    const nextIndex = (activeMediaIndex + direction + lightboxPool.length) % lightboxPool.length;
    setLightboxMedia(lightboxPool[nextIndex]);
    setMediaZoom(1);
    requestAnimationFrame(() => modalScrollRef.current?.scrollTo({ top: 0, left: 0 }));
  }, [activeMediaIndex, lightboxMedia, lightboxPool]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = root.current?.querySelectorAll<HTMLElement>(".case-hero > *:not(.case-color)");
    const animations = Array.from(elements || []).map((element, index) => element.animate(
      [{ transform: "translateY(32px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 780, delay: index * 70, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    ));
    return () => animations.forEach((animation) => animation.cancel());
  }, [project.slug]);

  useEffect(() => {
    setActiveSectionIndex(null);
    setLightboxMedia(null);
  }, [project.slug]);

  const selectSection = useCallback((index: number) => {
    setActiveSectionIndex(index);
    setLightboxMedia(null);
    requestAnimationFrame(() => {
      mediaWallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

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

  const categoryLine = [t(project.category), project.year].filter(Boolean).join(" / ");

  return (
    <main className="case-page" ref={root}>
      <section className="case-hero grid-surface">
        <SiteHeader name={site.name} />
        <div className="case-color" style={{ background: project.accent }} />
        <Link className="back-link" href="/#work">← {language === "zh" ? "所有作品" : "All work"}</Link>
        {categoryLine ? <span className="case-category">{categoryLine}</span> : null}
        <h1>{t(project.title)}</h1>
        <p>{t(project.summary)}</p>
        <div className="case-meta">
          <div><span>{language === "zh" ? "角色" : "Role"}</span><strong>{t(project.role)}</strong></div>
          {project.year ? <div><span>{language === "zh" ? "年份" : "Year"}</span><strong>{project.year}</strong></div> : null}
          <div><span>{language === "zh" ? "分类" : "Category"}</span><strong>{t(project.category)}</strong></div>
        </div>
        {project.externalUrl ? (
          <a className="case-external" href={project.externalUrl} target="_blank" rel="noreferrer">
            {language === "zh" ? "查看项目链接" : "View project link"} ↗
          </a>
        ) : null}
      </section>

      {project.metrics?.length ? (
        <section className="metrics">
          {project.metrics.map((metric) => (
            <div key={metric.value}>
              <strong>{metric.value}</strong>
              <span>{t(metric.label)}</span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="case-sections">
        {project.sections.map((section, index) => (
          <article className={`case-section tone-${section.tone || "light"}`} key={`${section.title.en}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")} / {t(section.eyebrow)}</span>
            <h2
              className={[
                richClass("case-title-size", section.titleStyle?.fontSize),
                weightClass(section.titleStyle?.fontWeight),
                alignClass("text", section.titleAlign),
              ].join(" ")}
            >
              {t(section.title)}
            </h2>
            <div
              className={[
                "case-body-block",
                richClass("rich-size", section.bodyStyle?.fontSize),
                weightClass(section.bodyStyle?.fontWeight),
              ].join(" ")}
            >
              <BodyContent body={t(section.body)} align={section.bodyAlign} tableAlign={section.tableAlign} />
            </div>
            {section.media?.length ? null : (
              <div className="case-placeholder">
                <span>{language === "zh" ? "在后台上传项目图片 / GIF / 视频 / PDF" : "Upload project image / GIF / video / PDF in admin"}</span>
                <div style={{ background: project.accent }} />
              </div>
            )}
          </article>
        ))}
      </section>

      <section className="case-section-index">
        <div className="case-project-media-heading">
          <span>{language === "zh" ? "项目目录" : "Project index"}</span>
          <h2>{language === "zh" ? "选择一个作品组" : "Choose a media set"}</h2>
          <p>{language === "zh" ? "先进入项目内的作品组，再查看该组下所有相关素材；这样一个项目不会被拆成零散图片。" : "Open a media set first, then browse all related files inside that set."}</p>
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
        <section className={`case-project-media-wall ${activeSectionMedia.length ? "" : "is-empty"}`} ref={mediaWallRef} data-active-media-wall="true">
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
              <span>{language === "zh" ? "这个作品组还没有上传文件" : "No files in this media set yet"}</span>
              <div style={{ background: project.accent }} />
            </div>
          )}
        </section>
      ) : null}

      {false && projectMedia.length ? (
        <section className="case-project-media-wall">
          <div className="case-project-media-heading">
            <span>{language === "zh" ? "项目文件" : "Project files"}</span>
            <h2>{language === "zh" ? "完整作品资料墙" : "Complete project media wall"}</h2>
            <p>{language === "zh" ? "点击任意文件可放大查看，并可左右切换同一项目下的所有相关素材。" : "Open any file to preview it larger and switch through all related media."}</p>
          </div>
          <div className="case-square-gallery">
            {projectMedia.map((item, index) => (
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
        </section>
      ) : (
        <section className="case-project-media-wall is-empty">
          <div className="case-placeholder">
            <span>{language === "zh" ? "在后台上传项目图片 / GIF / 视频 / PDF" : "Upload project image / GIF / video / PDF in admin"}</span>
            <div style={{ background: project.accent }} />
          </div>
        </section>
      )}

      {nextProject ? (
        <Link className="next-project" href={`/projects/${nextProject.slug}`}>
          <span>{language === "zh" ? "Next project" : "Next project"}</span>
          <h2>{t(nextProject.title)} -&gt;</h2>
        </Link>
      ) : null}

      {lightboxMedia ? (
        <div className="case-work-modal" role="dialog" aria-modal="true" aria-label={lightboxMedia.originalFilename || "Project media"}>
          <button className="case-work-modal-backdrop" type="button" onClick={() => setLightboxMedia(null)} aria-label="关闭作品弹框" />
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
                <div className="case-work-modal-toolbar" aria-label="图片缩放控制">
                  <button type="button" onClick={() => setMediaZoom((current) => Math.max(0.5, current - 0.25))} disabled={mediaZoom <= 0.5} aria-label="Zoom out">-</button>
                  <span>{Math.round(mediaZoom * 100)}%</span>
                  <button type="button" onClick={() => setMediaZoom((current) => Math.min(2.5, current + 0.25))} disabled={mediaZoom >= 2.5} aria-label="Zoom in">+</button>
                  <button type="button" className="case-work-modal-fit" onClick={() => setMediaZoom(1)}>{language === "zh" ? "适合宽度" : "Fit width"}</button>
                  <a href={assetPath(lightboxMedia.url)} target="_blank" rel="noreferrer">{language === "zh" ? "Original" : "Original"} -&gt;</a>
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
