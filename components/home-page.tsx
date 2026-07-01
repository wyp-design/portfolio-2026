"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { EducationItem, Project } from "@/content/types";
import type { SiteContent } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";
import { CinematicHero } from "./cinematic-hero";
import { SiteHeader } from "./site-header";

const HeroScene = dynamic(() => import("./hero-scene").then((module) => module.HeroScene), {
  ssr: false,
  loading: () => null,
});

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const assetPath = useAssetPath();
  const root = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number | null>(null);
  const sections = [...site.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const sectionNumber = (id: string) => `${String(sections.findIndex((section) => section.id === id) + 1).padStart(2, "0")} —`;
  const activeExperience =
    activeExperienceIndex === null ? null : site.experiences[activeExperienceIndex] || null;
  const heroStyle = site.heroStyle || "cinematic";
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
    const scope = root.current;
    if (!scope) return;
    const animations: Animation[] = [];
    scope.querySelectorAll<HTMLElement>(".hero-kicker, .hero-title-line, .hero-copy").forEach((element, index) => {
      animations.push(element.animate(
        [{ transform: "translateY(40px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 900, delay: index * 80, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
      ));
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        animations.push(element.animate(
          [{ transform: "translateY(64px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
          { duration: 850, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
        ));
        observer.unobserve(element);
      });
    }, { rootMargin: "0px 0px -15% 0px" });
    scope.querySelectorAll<HTMLElement>(".reveal").forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, []);

  useEffect(() => {
    if (activeExperienceIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveExperienceIndex(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeExperienceIndex]);

  return (
    <main ref={root} id="top">
      {sections.map((section) => {
        if (section.id === "hero") {
          return (
            <section className="hero grid-surface" key={section.id}>
              <SiteHeader name={site.name} />
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
              <div className="project-list">
                {projects.map((project, index) => (
                  <Link className="project-row reveal" href={`/projects/${project.slug}`} key={project.slug}>
                    <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <span className="project-category">{[t(project.category), project.year].filter(Boolean).join(" · ")}</span>
                      <h3>{t(project.title)}</h3>
                      <p className="rich-text">{t(project.summary)}</p>
                    </div>
                    <span className="project-orb" style={{ background: project.accent }} />
                    <span className="project-arrow">↗</span>
                  </Link>
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
                    <img
                      src={assetPath(site.aboutPhoto.url)}
                      alt={site.aboutPhoto.alt ? t(site.aboutPhoto.alt) : site.name}
                      loading="lazy"
                      decoding="async"
                    />
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
              <div className="contact-links reveal">
                <a className="email-link" href={`mailto:${site.email}`}>{site.email} ↗</a>
                {site.phone ? <a className="phone-link" href={`tel:${site.phone.replace(/\s+/g, "")}`}>{site.phone} ↗</a> : null}
              </div>
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

    </main>
  );
}
