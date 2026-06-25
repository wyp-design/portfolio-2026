import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/project-page";
import { getProject, getProjects, getSiteContent } from "@/lib/sanity/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return project ? { title: project.title.en, description: project.summary.en } : {};
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, projects, site] = await Promise.all([getProject(slug), getProjects(), getSiteContent()]);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(index + 1) % projects.length];
  return (
    <ProjectPage
      project={project}
      nextProject={nextProject.slug === project.slug ? undefined : nextProject}
      site={site}
    />
  );
}
