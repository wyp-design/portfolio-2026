"use client";

import dynamic from "next/dynamic";
import { sanityConfigured } from "@/lib/sanity/client";
import config from "@/sanity.config";

const NextStudio = dynamic(() => import("next-sanity/studio").then((module) => module.NextStudio), {
  ssr: false,
});

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main className="studio-empty">
        <div>
          <span>SANITY STUDIO</span>
          <h1>后台还差一个项目 ID。</h1>
          <p>复制 `.env.example` 为 `.env.local`，填入 Sanity 项目的 Project ID，然后重新启动网站。</p>
          <a href="https://www.sanity.io/manage" target="_blank" rel="noreferrer">打开 Sanity 管理台 ↗</a>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
