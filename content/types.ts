export type LocalizedText = {
  zh: string;
  en: string;
};

export type SiteContent = {
  name: string;
  shortRole: LocalizedText;
  intro: LocalizedText;
  bio: LocalizedText;
  aboutHeadline: LocalizedText;
  capabilities: LocalizedText[];
  email: string;
  social: Array<{ label: string; href: string }>;
};

export type Project = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  year: string;
  role: LocalizedText;
  category: LocalizedText;
  accent: string;
  order: number;
  featured?: boolean;
  externalUrl?: string;
  metrics?: Array<{ value: string; label: LocalizedText }>;
  sections: Array<{
    eyebrow: LocalizedText;
    title: LocalizedText;
    body: LocalizedText;
    tone?: "light" | "dark" | "blue" | "lime";
    media?: Array<{
      _type: "image" | "file";
      url: string;
      mimeType?: string;
      originalFilename?: string;
      alt?: LocalizedText;
    }>;
  }>;
};
