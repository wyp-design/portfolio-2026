"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader({ name = "YOUR.NAME" }: { name?: string }) {
  const { language, setLanguage } = useLanguage();
  const [dark, setDark] = useState(false);
  const [sound, setSound] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Home">
        {name}
      </Link>
      <button
        className="menu-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span />
        <span />
      </button>
      <nav className={open ? "nav-links is-open" : "nav-links"}>
        <Link href="/#work" onClick={() => setOpen(false)}>
          {language === "zh" ? "作品" : "Work"}
        </Link>
        <Link href="/#about" onClick={() => setOpen(false)}>
          {language === "zh" ? "关于" : "About"}
        </Link>
        <Link href="/#contact" onClick={() => setOpen(false)}>
          {language === "zh" ? "联系" : "Contact"}
        </Link>
        <button onClick={() => setLanguage(language === "zh" ? "en" : "zh")}>
          {language === "zh" ? "EN" : "中"}
        </button>
        <button onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
          THEME[{dark ? "B" : "A"}]
        </button>
        <button onClick={() => setSound((value) => !value)} aria-label="Toggle sound">
          SOUND[{sound ? "∿" : "–"}]
        </button>
      </nav>
    </header>
  );
}
