"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Project, SiteContent } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "./site-header";

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

  return (
    <main className="case-page" ref={root}>
      <section className="case-hero grid-surface">
        <SiteHeader name={site.name} />
        <div className="case-color" style={{ background: project.accent }} />
        <Link className="back-link" href="/#work">← {language === "zh" ? "所有作品" : "All work"}</Link>
        <span className="case-category">{t(project.category)} / {project.year}</span>
        <h1>{t(project.title)}</h1>
        <p>{t(project.summary)}</p>
        <div className="case-meta">
          <div><span>{language === "zh" ? "角色" : "Role"}</span><strong>{t(project.role)}</strong></div>
          <div><span>{language === "zh" ? "年份" : "Year"}</span><strong>{project.year}</strong></div>
          <div>
            <span>{language === "zh" ? "状态" : "Status"}</span>
            <strong>{project.status ? t(project.status) : language === "zh" ? "样板案例" : "Sample case"}</strong>
          </div>
        </div>
        {project.externalUrl ? (
          <a className="case-external" href={project.externalUrl} target="_blank" rel="noreferrer">
            {language === "zh" ? "查看外部链接" : "View external link"} ↗
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
            <h2>{t(section.title)}</h2>
            <p className={`rich-text rich-size-${section.bodyStyle?.fontSize || "medium"} rich-weight-${section.bodyStyle?.fontWeight || "regular"}`}>
              {t(section.body)}
            </p>
            {section.media?.length ? (
              <div className="case-media">
                {section.media.map((media) => {
                  if (media.mimeType === "application/pdf") {
                    return (
                      <a className="pdf-card" href={media.url} target="_blank" rel="noreferrer" key={media.url}>
                        <span>PDF</span>
                        <strong>{media.originalFilename || (language === "zh" ? "查看案例文档" : "View case document")}</strong>
                        <i>↗</i>
                      </a>
                    );
                  }

                  if (media.mimeType?.startsWith("video/")) {
                    return <video src={media.url} controls playsInline muted loop key={media.url} />;
                  }

                  return (
                    // Sanity assets may include animated GIFs, so native img preserves playback.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.url} alt={media.alt ? t(media.alt) : t(section.title)} key={media.url} />
                  );
                })}
              </div>
            ) : (
              <div className="case-placeholder">
                <span>{language === "zh" ? "在后台上传项目图片 / GIF / 视频" : "Upload project image / GIF / video in Studio"}</span>
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
    </main>
  );
}
