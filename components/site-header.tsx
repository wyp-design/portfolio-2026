"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader({ name = "PENN.W" }: { name?: string }) {
  const { language, setLanguage } = useLanguage();
  const [dark, setDark] = useState(true);
  const [sound, setSound] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const nav = language === "zh"
    ? { work: "作品", about: "关于", contact: "联系", lang: "EN" }
    : { work: "Work", about: "About", contact: "Contact", lang: "中" };

  return (
    <header className={open ? "site-header menu-open" : "site-header"}>
      <Link className="wordmark" href="/" aria-label="Home" onClick={() => setOpen(false)}>
        {name}
      </Link>
      <button
        className="menu-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={open ? "nav-links is-open" : "nav-links"}>
        <Link href="/#work" onClick={() => setOpen(false)}>
          {nav.work}
        </Link>
        <Link href="/#about" onClick={() => setOpen(false)}>
          {nav.about}
        </Link>
        <Link href="/#contact" onClick={() => setOpen(false)}>
          {nav.contact}
        </Link>
        <button type="button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>
          {nav.lang}
        </button>
        <button type="button" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
          THEME[{dark ? "B" : "A"}]
        </button>
        <button type="button" onClick={() => setSound((value) => !value)} aria-label="Toggle sound">
          SOUND[{sound ? "ON" : "OFF"}]
        </button>
      </nav>
    </header>
  );
}
