import { projects as demoProjects, siteCopy } from "@/content/demo";
import type { Project, SiteContent } from "@/content/types";
import { getPortfolioStore, PORTFOLIO_CONTENT_KEY } from "./blob-store";

export type PortfolioContent = {
  site: SiteContent;
  projects: Project[];
  updatedAt?: string;
};

export const defaultPortfolioContent: PortfolioContent = {
  site: siteCopy,
  projects: demoProjects,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizePortfolioContent(value: unknown): PortfolioContent {
  if (!isObject(value)) return defaultPortfolioContent;

  const maybeSite = isObject(value.site) ? value.site : {};
  const maybeProjects = Array.isArray(value.projects) ? value.projects : demoProjects;

  return {
    site: {
      ...siteCopy,
      ...maybeSite,
      social: Array.isArray(maybeSite.social) && maybeSite.social.length ? maybeSite.social : siteCopy.social,
      capabilities:
        Array.isArray(maybeSite.capabilities) && maybeSite.capabilities.length
          ? maybeSite.capabilities
          : siteCopy.capabilities,
    },
    projects: maybeProjects
      .filter((project): project is Project => isObject(project) && typeof project.slug === "string")
      .map((project, index) => ({
        ...project,
        order: typeof project.order === "number" ? project.order : index + 1,
        sections: Array.isArray(project.sections) ? project.sections : [],
      }))
      .sort((a, b) => a.order - b.order),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : undefined,
  };
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  try {
    const store = getPortfolioStore();
    const content = await store.get(PORTFOLIO_CONTENT_KEY, { type: "json", consistency: "strong" });
    return normalizePortfolioContent(content);
  } catch {
    return defaultPortfolioContent;
  }
}

export async function savePortfolioContent(content: PortfolioContent): Promise<PortfolioContent> {
  const nextContent = normalizePortfolioContent({
    ...content,
    updatedAt: new Date().toISOString(),
  });

  const store = getPortfolioStore();
  await store.setJSON(PORTFOLIO_CONTENT_KEY, nextContent, { cacheControl: "no-store" });
  return nextContent;
}

export async function getProjects(): Promise<Project[]> {
  const content = await getPortfolioContent();
  return content.projects;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export async function getSiteContent(): Promise<SiteContent> {
  const content = await getPortfolioContent();
  return content.site;
}
