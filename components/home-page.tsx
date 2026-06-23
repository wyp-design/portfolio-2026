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
          <span>{language === "zh" ? "上海 · 面向世界" : "Shanghai · Working globally"}</span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">{language === "zh" ? "让复杂变清晰" : "MAKE COMPLEX"}</span>
          <span className="hero-title-line outline">{language === "zh" ? "让体验有感觉" : "FEEL CLEAR"}</span>
        </h1>
        <p className="hero-copy">{t(site.intro)}</p>
        <div className="sticker sticker-one">✦</div>
        <div className="sticker sticker-two">UX↗</div>
        <div className="sticker sticker-three">GOOD<br />SYSTEMS</div>
        <div className="hero-index">001 / PORTFOLIO / 2026</div>
        <a className="scroll-cue" href="#work">{language === "zh" ? "向下探索" : "Scroll to explore"} ↓</a>
      </section>

      <section className="manifesto grid-surface reveal">
        <p>{language === "zh" ? "我相信好的设计不是装饰。" : "I believe good design is not decoration."}</p>
        <h2>
          {language === "zh" ? "它是对问题的理解，" : "IT IS UNDERSTANDING,"}
          <br />
          <span>{language === "zh" ? "也是对人的尊重。" : "AND RESPECT FOR PEOPLE."}</span>
        </h2>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading reveal">
          <span>02 — {language === "zh" ? "精选作品" : "Selected work"}</span>
          <p>{language === "zh" ? "横跨 AI、移动产品、设计系统与数据体验。" : "Across AI, mobile, design systems, and data experiences."}</p>
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
        <div className="about-label reveal">03 — {language === "zh" ? "关于我" : "About"}</div>
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
          <span>04 — {language === "zh" ? "一起创造" : "Let’s create"}</span>
          <h2>{language === "zh" ? "有意思的东西。" : "SOMETHING WITH MEANING."}</h2>
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
