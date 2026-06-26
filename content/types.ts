export type LocalizedText = {
  zh: string;
  en: string;
};

export type RichTextStyle = {
  fontSize?: "small" | "medium" | "large";
  fontWeight?: "regular" | "medium" | "bold";
};

export type UploadedMedia = {
  _type: "image" | "file";
  url: string;
  mimeType?: string;
  originalFilename?: string;
  alt?: LocalizedText;
};

export type HomeSectionId = "hero" | "manifesto" | "work" | "about" | "contact";

export type HomeSection = {
  id: HomeSectionId;
  label: LocalizedText;
  visible: boolean;
  order: number;
};

export type SiteContent = {
  name: string;
  sections: HomeSection[];
  shortRole: LocalizedText;
  location: LocalizedText;
  heroTitle: {
    line1: LocalizedText;
    line2: LocalizedText;
  };
  intro: LocalizedText;
  heroIndex: string;
  scrollLabel: LocalizedText;
  manifestoIntro: LocalizedText;
  manifestoLine1: LocalizedText;
  manifestoLine2: LocalizedText;
  workLabel: LocalizedText;
  workIntro: LocalizedText;
  bio: LocalizedText;
  bioStyle?: RichTextStyle;
  aboutLabel: LocalizedText;
  aboutHeadline: LocalizedText;
  aboutPhoto?: UploadedMedia;
  education: {
    school: LocalizedText;
    degree: LocalizedText;
    time: LocalizedText;
    description: LocalizedText;
    link?: string;
    style?: RichTextStyle;
  };
  experiences: Array<{
    company: LocalizedText;
    position: LocalizedText;
    time: LocalizedText;
    description: LocalizedText;
    link?: string;
    style?: RichTextStyle;
    modalTitleStyle?: RichTextStyle;
  }>;
  contactLabel: LocalizedText;
  contactHeadline: LocalizedText;
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
  status?: LocalizedText;
  externalUrl?: string;
  metrics?: Array<{ value: string; label: LocalizedText }>;
  sections: Array<{
    eyebrow: LocalizedText;
    title: LocalizedText;
    body: LocalizedText;
    bodyStyle?: RichTextStyle;
    tone?: "light" | "dark" | "blue" | "lime";
    media?: UploadedMedia[];
  }>;
};
