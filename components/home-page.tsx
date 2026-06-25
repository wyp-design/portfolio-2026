"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/content/types";
import type { SiteContent } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { HeroScene } from "./hero-scene";
import { SiteHeader } from "./site-header";

gsap.registerPlugin(ScrollTrigger);

export function HomePage({ projects, site }: { projects: Project[]; site: SiteContent }) {
  const root = useRef<HTMLElement>(null);
  const { language, t } = useLanguage();

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

  return (
    <main ref={root} id="top">
      <section className="hero grid-surface">
        <SiteHeader name={site.name} />
        <div className="hero-art">
          <div className="hero-image" />
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
        <p className="hero-copy">{t(site.intro)}</p>
        <div className="sticker sticker-one">✦</div>
        <div className="sticker sticker-two">UX↗</div>
        <div className="sticker sticker-three">GOOD<br />SYSTEMS</div>
        <div className="hero-index">{site.heroIndex}</div>
        <a className="scroll-cue" href="#work">{t(site.scrollLabel)} ↓</a>
      </section>

      <section className="manifesto grid-surface reveal">
        <p>{t(site.manifestoIntro)}</p>
        <h2>
          {t(site.manifestoLine1)}
          <br />
          <span>{t(site.manifestoLine2)}</span>
        </h2>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading reveal">
          <span>02 — {t(site.workLabel)}</span>
          <p>{t(site.workIntro)}</p>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <Link className="project-row reveal" href={`/projects/${project.slug}`} key={project.slug}>
              <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="project-category">{t(project.category)} · {project.year}</span>
                <h3>{t(project.title)}</h3>
                <p>{t(project.summary)}</p>
              </div>
              <span className="project-orb" style={{ background: project.accent }} />
              <span className="project-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-section grid-surface" id="about">
        <div className="about-label reveal">03 — {t(site.aboutLabel)}</div>
        <div className="about-copy reveal">
          <h2>{t(site.aboutHeadline)}</h2>
          <p>{t(site.bio)}</p>
        </div>
        <div className="capabilities reveal">
          {site.capabilities.map((capability, index) => (
            <div key={capability.en}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{t(capability)}</strong>
            </div>
          ))}
        </div>
      </section>

      <footer className="contact-section" id="contact">
        <div className="contact-top reveal">
          <span>04 — {t(site.contactLabel)}</span>
          <h2>{t(site.contactHeadline)}</h2>
        </div>
        <a className="email-link reveal" href={`mailto:${site.email}`}>{site.email} ↗</a>
        <div className="footer-row">
          <span>© 2026 {site.name}</span>
          <div>{site.social.map((item) => <a href={item.href} key={item.label}>{item.label}</a>)}</div>
          <a href="#top">{language === "zh" ? "回到顶部" : "Back to top"} ↑</a>
        </div>
      </footer>
    </main>
  );
}
