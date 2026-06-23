import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "YOUR.NAME — UI/UX Designer",
    template: "%s — YOUR.NAME",
  },
  description: "Bilingual UI/UX product design portfolio.",
  openGraph: {
    title: "YOUR.NAME — UI/UX Designer",
    description: "I turn complex systems into clear, human digital experiences.",
    images: ["/images/hero-atmosphere.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c7e7f8",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
