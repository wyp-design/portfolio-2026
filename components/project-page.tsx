"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
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
          <iframe src={assetPath(media.url)} title={media.originalFilename || "PDF preview"} />
        </div>
        <figcaption>{caption || media.originalFilename}</figcaption>
        <a href={assetPath(media.url)} target="_blank" rel="noreferrer">打开 PDF ↗</a>
      </figure>
    );
  }

  if (isVideo(media)) {
    return (
      <figure className={`case-media-figure case-media-${imageMode}`}>
        <video src={assetPath(media.url)} controls playsInline muted loop />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={`case-media-figure case-media-${imageMode}`}>
      <button type="button" className="case-image-button" onClick={onOpen} aria-label="放大查看图片">
        {/* Native img keeps GIF playback and works with GitHub Pages paths. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(media.url)} alt={caption || media.originalFilename || "Project media"} />
      </button>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
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
  const [lightboxMedia, setLightboxMedia] = useState<UploadedMedia | null>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(".case-hero > *:not(.case-color)", {
        y: 32,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, root);
    return () => context.revert();
  }, [project.slug]);

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
        <button className="case-lightbox" type="button" onClick={() => setLightboxMedia(null)} aria-label="关闭大图">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(lightboxMedia.url)} alt={lightboxMedia.originalFilename || "Project media"} />
          <span>{language === "zh" ? "点击关闭" : "Click to close"}</span>
        </button>
      ) : null}
    </main>
  );
}
