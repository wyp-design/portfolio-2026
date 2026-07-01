export type LocalizedText = {
  zh: string;
  en: string;
};

export type RichTextStyle = {
  fontSize?: "small" | "medium" | "large";
  fontWeight?: "regular" | "medium" | "bold";
};

export type TextAlign = "left" | "center" | "right";

export type EducationItem = {
  school: LocalizedText;
  degree: LocalizedText;
  time: LocalizedText;
  description: LocalizedText;
  link?: string;
  style?: RichTextStyle;
  titleStyle?: RichTextStyle;
};

export type UploadedMedia = {
  _type: "image" | "file";
  url: string;
  mimeType?: string;
  originalFilename?: string;
  title?: LocalizedText;
  alt?: LocalizedText;
  caption?: LocalizedText;
  layout?: "auto" | "portrait-grid" | "landscape-split" | "full";
  textPosition?: "left" | "right";
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
  heroStyle?: "original" | "cinematic";
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
  aboutHeadlineStyle?: RichTextStyle;
  aboutPhoto?: UploadedMedia;
  education: EducationItem;
  education2?: EducationItem;
  experiences: Array<{
    company: LocalizedText;
    position: LocalizedText;
    time: LocalizedText;
    description: LocalizedText;
    link?: string;
    style?: RichTextStyle;
    titleStyle?: RichTextStyle;
    modalTitleStyle?: RichTextStyle;
  }>;
  contactLabel: LocalizedText;
  contactHeadline: LocalizedText;
  email: string;
  phone?: string;
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
    titleStyle?: RichTextStyle;
    titleAlign?: TextAlign;
    bodyStyle?: RichTextStyle;
    bodyAlign?: TextAlign;
    tableAlign?: TextAlign;
    mediaLayout?: "auto" | "square-gallery" | "portrait-grid" | "landscape-split" | "full";
    splitPattern?: "image-left" | "image-right" | "abab";
    tone?: "light" | "dark" | "blue" | "lime";
    media?: UploadedMedia[];
  }>;
};
