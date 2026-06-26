"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/content/types";
import type { SiteContent } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { HeroScene } from "./hero-scene";
import { SiteHeader } from "./site-header";

gsap.registerPlugin(ScrollTrigger);

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const root = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();
  const [activeExperienceIndex, setActiveExperienceIndex] = useState<number | null>(null);
  const sections = [...site.sections].filter((section) => section.visible).sort((a, b) => a.order - b.order);
  const sectionNumber = (id: string) => `${String(sections.findIndex((section) => section.id === id) + 1).padStart(2, "0")} —`;
  const activeExperience =
    activeExperienceIndex === null ? null : site.experiences[activeExperienceIndex] || null;

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
    if (activeExperienceIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveExperienceIndex(null);
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
                <div className="hero-image" style={{ backgroundImage: `url(${assetPath("/images/hero-atmosphere.png")})` }} />
                <HeroScene />
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
                      <span className="project-category">{t(project.category)} · {project.year}</span>
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
                    <img src={assetPath(site.aboutPhoto.url)} alt={site.aboutPhoto.alt ? t(site.aboutPhoto.alt) : site.name} />
                  ) : (
                    <span>{language === "zh" ? "后台上传个人照片" : "Upload portrait in admin"}</span>
                  )}
                </div>
              </div>
              <div className="about-copy reveal">
                <h2>{t(site.aboutHeadline)}</h2>
                <p className={`rich-text rich-size-${site.bioStyle?.fontSize || "medium"} rich-weight-${site.bioStyle?.fontWeight || "regular"}`}>
                  {t(site.bio)}
                </p>
                <div className="about-info">
                  <article>
                    <span>EDU</span>
                    <h3>{t(site.education.school)}</h3>
                    <strong>{t(site.education.degree)} · {t(site.education.time)}</strong>
                    <p className={`rich-text rich-size-${site.education.style?.fontSize || "small"} rich-weight-${site.education.style?.fontWeight || "regular"}`}>
                      {t(site.education.description)}
                    </p>
                    {site.education.link ? <a href={site.education.link} target="_blank" rel="noreferrer">Link ↗</a> : null}
                  </article>
                  {site.experiences.map((experience, index) => (
                    <article key={`${experience.company.en}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <button className="experience-trigger" type="button" onClick={() => setActiveExperienceIndex(index)}>
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
            <h2 id="experience-modal-title">{t(activeExperience.company)}</h2>
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
