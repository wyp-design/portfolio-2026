import { projects as demoProjects, siteCopy } from "@/content/demo";
import committedContent from "@/content/portfolio-content.json";
import type { Project, SiteContent } from "@/content/types";

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
  const maybeProjects = Array.isArray(value.projects) && value.projects.length ? value.projects : demoProjects;
  const maybeHeroTitle = isObject(maybeSite.heroTitle) ? maybeSite.heroTitle : {};

  return {
    site: {
      ...siteCopy,
      ...maybeSite,
      heroTitle: {
        ...siteCopy.heroTitle,
        ...maybeHeroTitle,
      },
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
  return normalizePortfolioContent(committedContent);
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
