"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { ResilientImage } from "@/components/resilient-image";
import type { Project, SiteContent, UploadedMedia } from "@/content/types";
import { useLanguage } from "@/lib/i18n";
import { useAssetPath } from "@/lib/use-asset-path";

type HomePageProps = { projects: Project[]; site: SiteContent };

const copy = {
  zh: {
    available: "\u53ef\u63a5\u53d7\u65b0\u7684\u5408\u4f5c",
    heroA: "\u8bbe\u8ba1\u8ba9\u590d\u6742",
    heroB: "\u53d8\u5f97\u6e05\u6670",
    heroNote: "\u4e0d\u53ea\u5173\u6ce8\u89c6\u89c9\uff0c\u4e5f\u8ba9\u6570\u5b57\u4f53\u9a8c\u771f\u6b63\u597d\u7528\u3002",
    about: "\u5173\u4e8e\u6211",
    aboutTitle: "\u6211\u505a\u8ba9\u4eba\u8bb0\u5f97\u4f4f\u7684\u8bbe\u8ba1",
    projects: "\u4f5c\u54c1\u96c6",
    projectsTitle: "\u4f1a\u8bb2\u6545\u4e8b\u7684\u9879\u76ee",
    services: "\u80fd\u529b",
    servicesTitle: "\u6211\u53ef\u4ee5\u4e3a\u4f60\u505a\u4ec0\u4e48",
    reviews: "\u5408\u4f5c",
    reviewsTitle: "\u50cf\u7d20\u80cc\u540e\u7684\u5408\u4f5c\u4f53\u9a8c",
    faq: "\u5e38\u89c1\u95ee\u9898",
    faqTitle: "\u5f00\u59cb\u4e4b\u524d\uff0c\u4f60\u53ef\u80fd\u60f3\u77e5\u9053",
    education: "\u6559\u80b2\u7ecf\u5386",
    experience: "\u5de5\u4f5c\u7ecf\u5386",
    contact: "\u8054\u7cfb\u6211",
    contactTitle: "\u4e00\u8d77\u505a\u70b9\u503c\u5f97\u8bb0\u4f4f\u7684\u4e1c\u897f",
    view: "\u67e5\u770b\u9879\u76ee",
    start: "\u5f00\u59cb\u5408\u4f5c",
  },
  en: {
    available: "Available for new work",
    heroA: "Design makes",
    heroB: "complexity clear",
    heroNote: "Not just visuals. I make digital experiences clear and useful.",
    about: "About",
    aboutTitle: "I make designs people remember",
    projects: "Projects",
    projectsTitle: "Projects that tell stories",
    services: "Services",
    servicesTitle: "Where I can help you",
    reviews: "Reviews",
    reviewsTitle: "Collaboration behind the pixels",
    faq: "FAQs",
    faqTitle: "Answers before we begin",
    education: "Education",
    experience: "Experience",
    contact: "Contact",
    contactTitle: "Let's build something memorable",
    view: "View project",
    start: "Start a project",
  },
};

const serviceRows = [
  ["Website Design", "UI / UX"],
  ["Product Experience", "Apps / Systems"],
  ["Brand Identity", "Visual Language"],
  ["AI Exploration", "Creative Workflow"],
];

function firstMedia(project: Project): UploadedMedia | undefined {
  return project.sections.flatMap((section) => section.media ?? []).find((media) => media.url);
}

function CursorEyes() {
  const ref = useRef<HTMLDivElement>(null);
  const pupils = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const node = ref.current;
    if (!node) return;
    let targetX = -120;
    let targetY = -120;
    let currentX = -120;
    let currentY = -120;
    let frame = 0;

    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      node.dataset.visible = "true";
      const dx = event.movementX;
      const dy = event.movementY;
      const length = Math.max(1, Math.hypot(dx, dy));
      pupils.current.forEach((pupil) => {
        if (pupil) pupil.style.transform = `translate(${(dx / length) * 3}px, ${(dy / length) * 3}px)`;
      });
    };
    const leave = () => {
      node.dataset.visible = "false";
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.34;
      currentY += (targetY - currentY) * 0.34;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className="creatie-cursor-eyes" aria-hidden="true">
      {[0, 1].map((index) => (
        <span className="creatie-cursor-eye" key={index}>
          <span ref={(node) => { pupils.current[index] = node; }} className="creatie-cursor-pupil" />
        </span>
      ))}
    </div>
  );
}

function Dock() {
  return (
    <nav className="creatie-dock" aria-label="Page navigation">
      <a className="creatie-dock-app app-notes" href="#about" aria-label="About"><span /></a>
      <a className="creatie-dock-app app-photos" href="#work" aria-label="Projects"><span /></a>
      <a className="creatie-dock-app app-finder" href="#services" aria-label="Services"><span /></a>
      <a className="creatie-dock-app app-mail" href="#contact" aria-label="Contact"><span /></a>
    </nav>
  );
}

function ProjectCard({ project, index, label }: { project: Project; index: number; label: string }) {
  const { t } = useLanguage();
  const media = firstMedia(project);
  const angle = [-4, 2, -2, 3, -3][index % 5];
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`creatie-project-card project-${index + 1}`}
      style={{ "--card-angle": `${angle}deg` } as CSSProperties}
      aria-label={`${label}: ${t(project.title)}`}
    >
      <div className="creatie-window-bar"><i /><i /><i /><b /></div>
      <div className="creatie-project-image">
        {media ? (
          <ResilientImage
            src={media.thumbnailUrl || media.url}
            fallbackSrc={media.url}
            alt={t(media.alt || media.title) || t(project.title)}
            loading="lazy"
          />
        ) : (
          <div className="creatie-project-placeholder" style={{ background: project.accent }}>{t(project.title)}</div>
        )}
      </div>
      <footer>
        <strong>{t(project.title)}</strong>
        <span>{t(project.category)}{project.year ? ` / ${project.year}` : ""}</span>
      </footer>
    </Link>
  );
}

export function HomePage({ projects, site }: HomePageProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const resolveAssetPath = useAssetPath();
  const [photoOpen, setPhotoOpen] = useState(false);
  const text = copy[language];
  const featured = useMemo(
    () => [...projects].filter((project) => project.featured !== false).sort((a, b) => a.order - b.order).slice(0, 5),
    [projects],
  );
  const education = [site.education, site.education2].filter(Boolean) as NonNullable<SiteContent["education2"]>[];
  const heroBackground = resolveAssetPath("/images/creatie-bg.avif");

  return (
    <main className="creatie-page-v7">
      <CursorEyes />
      <Dock />

      <section className="creatie-hero-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(15,34,33,.08), rgba(12,29,27,.22)), url("${heroBackground}")` }}>
        <header className="creatie-topbar-v7">
          <a href="#top" className="creatie-brand-v7">{site.name || "CREATIE"}</a>
          <button type="button" onClick={toggleLanguage}>{language === "zh" ? "EN" : "CN"}</button>
        </header>
        <div id="top" className="creatie-status-v7">
          {site.aboutPhoto?.url ? <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} /> : <span className="creatie-avatar-fallback">PW</span>}
          <span><i />{text.available}<strong>{site.name} / {t(site.shortRole)}</strong></span>
        </div>
        <div className="creatie-hero-title-v7">
          <span className="creatie-eyes-static" aria-hidden="true"><i /><i /></span>
          <h1><span>{text.heroA}</span><span>{text.heroB}</span></h1>
          <div className="creatie-skill-tag tag-a">UI/UX Design</div>
          <div className="creatie-skill-tag tag-b">AI Design</div>
          <div className="creatie-skill-tag tag-c">Visual</div>
        </div>
        <p className="creatie-hero-note-v7">{text.heroNote}</p>
        {featured[0] && (
          <Link href={`/projects/${featured[0].slug}`} className="creatie-mini-project-v7">
            {firstMedia(featured[0]) && <ResilientImage src={firstMedia(featured[0])!.thumbnailUrl || firstMedia(featured[0])!.url} fallbackSrc={firstMedia(featured[0])!.url} alt={t(featured[0].title)} />}
            <span>{t(featured[0].category)}<strong>{t(featured[0].title)}</strong></span>
            <b>&rarr;</b>
          </Link>
        )}
      </section>

      <section id="about" className="creatie-paper-section creatie-about-v7">
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7">
            <span>{text.about}</span>
            <h2>{text.aboutTitle}</h2>
          </div>
          <div className="creatie-about-profile-v7">
            <button type="button" className="creatie-about-photo-v7" onClick={() => setPhotoOpen(true)} disabled={!site.aboutPhoto?.url} aria-label="Open portrait">
              {site.aboutPhoto?.url ? <ResilientImage src={site.aboutPhoto.thumbnailUrl || site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} /> : <span>PW</span>}
            </button>
            <div className="creatie-about-identity-v7">
              <h3>{site.name}</h3>
              <p>{t(site.shortRole)}</p>
              <div><a href={`mailto:${site.email}`}>{site.email}</a>{site.phone && <a href={`tel:${site.phone}`}>{site.phone}</a>}</div>
            </div>
          </div>
          <p className="creatie-about-copy-v7">{t(site.bio) || t(site.intro)}</p>
          <div className="creatie-about-columns-v7">
            <div>
              <h4>{text.education}</h4>
              {education.map((item, index) => (
                <article key={`${t(item.school)}-${index}`}><span>{index + 1}</span><div><h5>{t(item.school)}</h5><p>{t(item.degree)}</p><small>{t(item.time)}</small></div></article>
              ))}
            </div>
            <div>
              <h4>{text.experience}</h4>
              {site.experiences.map((item, index) => (
                <article key={`${t(item.company)}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h5>{t(item.company)}</h5><p>{t(item.position)}</p><small>{t(item.time)}</small><em>{t(item.description)}</em></div></article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="creatie-landscape-section creatie-work-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(241,238,217,.08), rgba(40,61,38,.12)), url("${heroBackground}")` }}>
        <div className="creatie-section-heading-v7 dark-heading">
          <span>{text.projects}</span>
          <h2>{text.projectsTitle}</h2>
        </div>
        <div className="creatie-project-stage-v7">
          {featured.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} label={text.view} />)}
        </div>
      </section>

      <section id="services" className="creatie-paper-section creatie-services-v7">
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.services}</span><h2>{text.servicesTitle}</h2></div>
          <div className="creatie-service-list-v7">
            {serviceRows.map(([title, detail], index) => <article key={title} style={{ "--row": index } as CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p><b>&rarr;</b></article>)}
          </div>
        </div>
      </section>

      <section className="creatie-paper-section creatie-reviews-v7">
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.reviews}</span><h2>{text.reviewsTitle}</h2></div>
          <div className="creatie-review-cards-v7">
            <article><small>01</small><h3>"Clear thinking, strong execution."</h3><p>The work turned a complex product into a system people could understand and use.</p></article>
            <article><small>02</small><h3>"The flow became much easier."</h3><p>Every decision felt focused, practical and ready for development.</p></article>
            <article><small>03</small><h3>"Sharp design without noise."</h3><p>A thoughtful balance of visual character, usability and business goals.</p></article>
          </div>
        </div>
      </section>

      <section className="creatie-paper-section creatie-faq-v7">
        <div className="creatie-section-shell-v7">
          <div className="creatie-section-heading-v7"><span>{text.faq}</span><h2>{text.faqTitle}</h2></div>
          <div className="creatie-faq-grid-v7">
            {["What can you design?", "How fast can we start?", "Do you work with developers?", "What do you need from me?"].map((question, index) => <details key={question}><summary>{question}<b>+</b></summary><p>{index === 0 ? "Product strategy, UI/UX, design systems, websites and visual communication." : "Send a short brief and any existing materials. I will turn them into a clear project plan."}</p></details>)}
          </div>
        </div>
      </section>

      <section id="contact" className="creatie-contact-v7" style={{ backgroundImage: `linear-gradient(180deg, rgba(20,48,43,.04), rgba(20,48,43,.16)), url("${heroBackground}")` }}>
        <div><span>{text.contact}</span><h2>{text.contactTitle}</h2><a href={`mailto:${site.email}`}>{text.start} &rarr;</a></div>
        <footer><strong>{site.name}</strong><nav>{site.social.map((item) => <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{item.label}</a>)}</nav></footer>
      </section>

      {photoOpen && site.aboutPhoto?.url && (
        <div className="creatie-photo-modal-v7" role="dialog" aria-modal="true" onClick={() => setPhotoOpen(false)}>
          <button type="button" onClick={() => setPhotoOpen(false)} aria-label="Close">x</button>
          <ResilientImage src={site.aboutPhoto.url} fallbackSrc={site.aboutPhoto.url} alt={site.name} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </main>
  );
}
