import { HomePage } from "@/components/home-page";
import { getProjects, getSiteContent } from "@/lib/sanity/data";

export default async function Page() {
  const [projects, site] = await Promise.all([getProjects(), getSiteContent()]);
  return <HomePage projects={projects} site={site} />;
}
