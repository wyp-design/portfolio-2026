import { projects as demoProjects, siteCopy } from "@/content/demo";
import type { Project, SiteContent } from "@/content/types";
import { sanityClient } from "./client";
import { projectQuery, projectsQuery, siteContentQuery } from "./queries";

export async function getProjects(): Promise<Project[]> {
  if (!sanityClient) return demoProjects;

  try {
    const result = await sanityClient.fetch<Project[]>(projectsQuery, {}, { next: { revalidate: 60 } });
    return result.length ? result : demoProjects;
  } catch {
    return demoProjects;
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  if (!sanityClient) return demoProjects.find((project) => project.slug === slug);

  try {
    const result = await sanityClient.fetch<Project | null>(
      projectQuery,
      { slug },
      { next: { revalidate: 60 } },
    );
    return result || demoProjects.find((project) => project.slug === slug);
  } catch {
    return demoProjects.find((project) => project.slug === slug);
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!sanityClient) return siteCopy;

  try {
    const result = await sanityClient.fetch<{
      settings?: Partial<SiteContent>;
      about?: Partial<SiteContent>;
    }>(siteContentQuery, {}, { next: { revalidate: 60 } });

    return {
      ...siteCopy,
      ...(result.settings || {}),
      ...(result.about || {}),
      social: result.settings?.social?.length ? result.settings.social : siteCopy.social,
      capabilities: result.about?.capabilities?.length ? result.about.capabilities : siteCopy.capabilities,
    };
  } catch {
    return siteCopy;
  }
}
