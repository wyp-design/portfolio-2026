"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LocalizedText, Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { SiteHeader } from "./site-header";

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
        {/* Native img keeps GIF playback and works with GitHub Pages paths. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(media.url)} alt={caption || media.originalFilename || "Project media"} loading="lazy" decoding="async" />
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
  return (
    <button className="case-gallery-card" type="button" onClick={onOpen} aria-label={`打开作品 ${index + 1}`}>
      {isPdf(media) ? (
        <span className="case-gallery-file">PDF</span>
      ) : isVideo(media) ? (
        <video src={assetPath(media.url)} muted playsInline preload="metadata" />
      ) : media.mimeType === "image/gif" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={assetPath(media.url)} alt={title || caption || media.originalFilename || `Project media ${index + 1}`} loading="lazy" decoding="async" />
      ) : (
        <Image
          src={assetPath(media.url)}
          alt={title || caption || media.originalFilename || `Project media ${index + 1}`}
          fill
          sizes="(max-width: 800px) 50vw, 25vw"
          quality={72}
        />
      )}
      <span className="case-gallery-shade" />
      <span className="case-gallery-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="case-gallery-plus">＋</span>
      <strong>{title || media.originalFilename || "查看作品"}</strong>
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
  const { language, t } = useLanguage();
  const root = useRef<HTMLElement>(null);
  const modalScrollRef = useRef<HTMLElement>(null);
  const [lightboxMedia, setLightboxMedia] = useState<UploadedMedia | null>(null);

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
    if (!lightboxMedia) return;
    const modal = modalScrollRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxMedia(null);
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
  }, [lightboxMedia]);

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
            {section.media?.length ? (
              <SectionMedia section={section} t={t} onOpen={setLightboxMedia} />
            ) : (
              <div className="case-placeholder">
                <span>{language === "zh" ? "在后台上传项目图片 / GIF / 视频 / PDF" : "Upload project image / GIF / video / PDF in admin"}</span>
                <div style={{ background: project.accent }} />
              </div>
            )}
          </article>
        ))}
      </section>

      {nextProject ? (
        <Link className="next-project" href={`/projects/${nextProject.slug}`}>
          <span>{language === "zh" ? "下一个项目" : "Next project"}</span>
          <h2>{t(nextProject.title)} ↗</h2>
        </Link>
      ) : null}

      {lightboxMedia ? (
        <div className="case-work-modal" role="dialog" aria-modal="true" aria-label={lightboxMedia.originalFilename || "Project media"}>
          <button className="case-work-modal-backdrop" type="button" onClick={() => setLightboxMedia(null)} aria-label="关闭作品弹框" />
          <article className="case-work-modal-card" ref={modalScrollRef}>
            <button className="case-work-modal-close" type="button" onClick={() => setLightboxMedia(null)} aria-label="关闭">×</button>
            <header>
              <span>{language === "zh" ? "作品说明" : "Project note"}</span>
              <h2>{lightboxMedia.title ? t(lightboxMedia.title) : (lightboxMedia.originalFilename || t(project.title))}</h2>
              <p className="rich-text">
                {lightboxMedia.caption ? t(lightboxMedia.caption) : (language === "zh" ? "暂未填写作品说明。" : "No project note yet.")}
              </p>
            </header>
            <div className="case-work-modal-media">
              {isPdf(lightboxMedia) ? (
                <iframe src={assetPath(lightboxMedia.url)} title={lightboxMedia.originalFilename || "PDF preview"} loading="lazy" />
              ) : isVideo(lightboxMedia) ? (
                <video src={assetPath(lightboxMedia.url)} controls playsInline autoPlay />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={assetPath(lightboxMedia.url)} alt={lightboxMedia.originalFilename || "Project media"} decoding="async" />
              )}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
