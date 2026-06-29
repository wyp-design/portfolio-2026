"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { EducationItem, Project, UploadedMedia } from "@/content/types";
import type { SiteContent } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { HeroScene } from "./hero-scene";
import { CinematicHero } from "./cinematic-hero";
import { SiteHeader } from "./site-header";

gsap.registerPlugin(ScrollTrigger);

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const root = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number | null>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [darkTheme, setDarkTheme] = useState(false);
  const sections = [...site.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const sectionNumber = (id: string) => `${String(sections.findIndex((section) => section.id === id) + 1).padStart(2, "0")} —`;
  const activeExperience =
    activeExperienceIndex === null ? null : site.experiences[activeExperienceIndex] || null;
  const activeProject = activeProjectIndex === null ? null : projects[activeProjectIndex] || null;
  const heroStyle = darkTheme ? (site.heroStyleDark || "original") : (site.heroStyleLight || "original");
  const educationItems = [site.education, site.education2].filter((education): education is EducationItem => {
    if (!education) return false;
    return Boolean(t(education.school).trim() || t(education.degree).trim() || t(education.time).trim());
  });
  const bioBlocks = t(site.bio)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const firstPointIndex = bioBlocks.findIndex((block) => /^\s*(\d+[、.．]|[*-]*\s*\*\*\d+[、.．])/.test(block));
  const bioIntro = firstPointIndex >= 0 ? bioBlocks.slice(0, firstPointIndex).join("\n\n") : t(site.bio);
  const bioPoints = firstPointIndex >= 0 ? bioBlocks.slice(firstPointIndex) : [];

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const context = gsap.context(() => {
      gsap.from(".hero-kicker, .hero-title-line, .hero-copy", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.from(element, {
          y: 64,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 85%" },
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  useEffect(() => {
    if (activeExperienceIndex === null && activeProjectIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveExperienceIndex(null);
        setActiveProjectIndex(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeExperienceIndex, activeProjectIndex]);

  return (
    <main ref={root} id="top">
      {sections.map((section) => {
        if (section.id === "hero") {
          return (
            <section className="hero grid-surface" key={section.id}>
              <SiteHeader name={site.name} onThemeChange={setDarkTheme} />
              <div className="hero-art">
                {heroStyle === "cinematic" ? (
                  <CinematicHero />
                ) : (
                  <>
                    <div className="hero-image" style={{ backgroundImage: `url(${assetPath("/images/hero-atmosphere.png")})` }} />
                    <HeroScene />
                  </>
                )}
              </div>
              <div className="hero-kicker">
                <span>{t(site.shortRole)}</span>
                <span>{t(site.location)}</span>
              </div>
              <h1 className="hero-title">
                <span className="hero-title-line">{t(site.heroTitle.line1)}</span>
                <span className="hero-title-line outline">{t(site.heroTitle.line2)}</span>
              </h1>
              <p className="hero-copy rich-text rich-size-small rich-weight-regular">{t(site.intro)}</p>
              <div className="sticker sticker-one">✦</div>
              <div className="sticker sticker-two">UX↗</div>
              <div className="sticker sticker-three">GOOD<br />SYSTEMS</div>
              <div className="hero-index">{site.heroIndex}</div>
              <a className="scroll-cue" href="#work">{t(site.scrollLabel)} ↓</a>
            </section>
          );
        }

        if (section.id === "manifesto") {
          return (
            <section className="manifesto grid-surface reveal" key={section.id}>
              <p className="rich-text">{t(site.manifestoIntro)}</p>
              <h2>
                {t(site.manifestoLine1)}
                <br />
                <span>{t(site.manifestoLine2)}</span>
              </h2>
            </section>
          );
        }

        if (section.id === "work") {
          return (
            <section className="work-section" id="work" key={section.id}>
              <div className="section-heading reveal">
                <span>{sectionNumber("work")} {t(site.workLabel)}</span>
                <p className="rich-text">{t(site.workIntro)}</p>
              </div>
              <div className="project-gallery">
                {projects.map((project, index) => (
                  <button className="project-tile reveal" type="button" onClick={() => setActiveProjectIndex(index)} key={project.slug}>
                    <ProjectTileMedia project={project} title={t(project.title)} />
                    <span className="project-tile-shade" />
                    <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="project-tile-copy">
                      <small>{[t(project.category), project.year].filter(Boolean).join(" · ")}</small>
                      <strong>{t(project.title)}</strong>
                    </span>
                    <span className="project-arrow">＋</span>
                  </button>
                ))}
              </div>
            </section>
          );
        }

        if (section.id === "about") {
          return (
            <section className="about-section grid-surface" id="about" key={section.id}>
              <div className="about-side reveal">
                <div className="about-label">{sectionNumber("about")} {t(site.aboutLabel)}</div>
                <div className="about-photo">
                  {site.aboutPhoto?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetPath(site.aboutPhoto.url)} alt={site.aboutPhoto.alt ? t(site.aboutPhoto.alt) : site.name} />
                  ) : (
                    <span>{language === "zh" ? "后台上传个人照片" : "Upload portrait in admin"}</span>
                  )}
                </div>
              </div>
              <div className="about-copy reveal">
                <h2 className={`rich-size-${site.aboutHeadlineStyle?.fontSize || "large"} rich-weight-${site.aboutHeadlineStyle?.fontWeight || "bold"}`}>
                  {t(site.aboutHeadline)}
                </h2>
                <div className={`about-bio rich-size-${site.bioStyle?.fontSize || "medium"} rich-weight-${site.bioStyle?.fontWeight || "regular"}`}>
                  <p className="about-bio-intro rich-text">{bioIntro}</p>
                  {bioPoints.length ? (
                    <div className="about-bio-points">
                      {bioPoints.map((point, index) => (
                        <p className="rich-text" key={`${point}-${index}`}>{point}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="about-info">
                  <div className="education-list">
                    {educationItems.map((education, index) => (
                      <article className="education-card" key={`${education.school.en}-${index}`}>
                        <span>{index === 0 ? "EDU" : "EDU 02"}</span>
                        <h3 className={`rich-size-${education.titleStyle?.fontSize || (index === 0 ? "large" : "medium")} rich-weight-${education.titleStyle?.fontWeight || "bold"}`}>
                          {t(education.school)}
                        </h3>
                        <strong>{t(education.degree)} · {t(education.time)}</strong>
                        {education.link ? <a href={education.link} target="_blank" rel="noreferrer">Link ↗</a> : null}
                      </article>
                    ))}
                  </div>
                  {site.experiences.map((experience, index) => (
                    <article key={`${experience.company.en}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button
                        className={`experience-trigger rich-size-${experience.titleStyle?.fontSize || "medium"} rich-weight-${experience.titleStyle?.fontWeight || "bold"}`}
                        type="button"
                        onClick={() => setActiveExperienceIndex(index)}
                      >
                        {t(experience.company)}
                      </button>
                      <strong>{t(experience.position)} · {t(experience.time)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.id === "contact") {
          return (
            <footer className="contact-section" id="contact" key={section.id}>
              <div className="contact-top reveal">
                <span>{sectionNumber("contact")} {t(site.contactLabel)}</span>
                <h2>{t(site.contactHeadline)}</h2>
              </div>
              <a className="email-link reveal" href={`mailto:${site.email}`}>{site.email} ↗</a>
              <div className="footer-row">
                <span>© 2026 {site.name}</span>
                <div>{site.social.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}</div>
                <a href="#top">{language === "zh" ? "回到顶部" : "Back to top"} ↑</a>
              </div>
            </footer>
          );
        }

        return null;
      })}

      {activeExperience ? (
        <div className="experience-modal" role="dialog" aria-modal="true" aria-labelledby="experience-modal-title">
          <button className="experience-modal-backdrop" type="button" onClick={() => setActiveExperienceIndex(null)}>
            <span>Close</span>
          </button>
          <div className="experience-modal-card">
            <button className="experience-modal-close" type="button" onClick={() => setActiveExperienceIndex(null)}>
              ×
            </button>
            <span className="experience-modal-kicker">
              {activeExperienceIndex !== null ? String(activeExperienceIndex + 1).padStart(2, "0") : "01"} / EXPERIENCE
            </span>
            <h2
              id="experience-modal-title"
              className={`rich-size-${activeExperience.modalTitleStyle?.fontSize || "medium"} rich-weight-${activeExperience.modalTitleStyle?.fontWeight || "bold"}`}
            >
              {t(activeExperience.company)}
            </h2>
            <strong>{t(activeExperience.position)} · {t(activeExperience.time)}</strong>
            <p className={`rich-text rich-size-${activeExperience.style?.fontSize || "medium"} rich-weight-${activeExperience.style?.fontWeight || "regular"}`}>
              {t(activeExperience.description)}
            </p>
            {activeExperience.link ? (
              <a href={activeExperience.link} target="_blank" rel="noreferrer">
                {language === "zh" ? "查看项目链接" : "View project"} ↗
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeProject ? (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <button className="project-modal-backdrop" type="button" onClick={() => setActiveProjectIndex(null)} aria-label="关闭项目弹框" />
          <article className="project-modal-card">
            <button className="project-modal-close" type="button" onClick={() => setActiveProjectIndex(null)} aria-label="关闭">×</button>
            <header className="project-modal-copy">
              <span>{[t(activeProject.category), activeProject.year].filter(Boolean).join(" · ")}</span>
              <h2 id="project-modal-title">{t(activeProject.title)}</h2>
              <p className="rich-text">{t(activeProject.summary)}</p>
              <div className="project-modal-meta">
                <span>{language === "zh" ? "角色" : "Role"}</span>
                <strong>{t(activeProject.role)}</strong>
              </div>
              <Link href={`/projects/${activeProject.slug}`}>
                {language === "zh" ? "打开完整项目页" : "Open full project"} ↗
              </Link>
            </header>
            <div className="project-modal-media">
              {activeProject.sections.map((projectSection, sectionIndex) => (
                <section key={`${activeProject.slug}-${sectionIndex}`}>
                  <div className="project-modal-section-copy">
                    <span>{t(projectSection.eyebrow)}</span>
                    <h3>{t(projectSection.title)}</h3>
                    <p className="rich-text">{t(projectSection.body)}</p>
                  </div>
                  {projectSection.media?.map((media, mediaIndex) => (
                    <ProjectModalMedia media={media} title={t(activeProject.title)} key={`${media.url}-${mediaIndex}`} />
                  ))}
                </section>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}

function firstProjectMedia(project: Project) {
  return project.sections.flatMap((section) => section.media || [])[0];
}

function isVideoMime(mimeType?: string) {
  return Boolean(mimeType?.startsWith("video/"));
}

function ProjectTileMedia({ project, title }: { project: Project; title: string }) {
  const media = firstProjectMedia(project);
  if (!media) return <span className="project-tile-fallback" style={{ background: project.accent }}>{title}</span>;
  if (media.mimeType === "application/pdf") return <span className="project-tile-fallback project-tile-pdf">PDF<br />{media.originalFilename}</span>;
  if (isVideoMime(media.mimeType)) return <video src={assetPath(media.url)} muted playsInline loop autoPlay />;
  return <img src={assetPath(media.url)} alt={media.alt ? media.alt.zh || media.alt.en : title} />;
}

function ProjectModalMedia({ media, title }: { media: UploadedMedia; title: string }) {
  if (media.mimeType === "application/pdf") {
    return <iframe className="project-modal-pdf" src={assetPath(media.url)} title={media.originalFilename || title} />;
  }
  if (isVideoMime(media.mimeType)) {
    return <video className="project-modal-visual" src={assetPath(media.url)} controls playsInline />;
  }
  return <img className="project-modal-visual" src={assetPath(media.url)} alt={media.alt?.zh || media.alt?.en || title} />;
}
