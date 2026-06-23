export const projectsQuery = `*[_type == "project" && published == true] | order(orderRank asc, order asc) {
  "slug": slug.current,
  title,
  summary,
  year,
  role,
  category,
  accent,
  order,
  featured,
  externalUrl,
  metrics,
  sections[]{
    eyebrow,
    title,
    body,
    tone,
    media[]{
      _type,
      alt,
      "url": asset->url,
      "mimeType": asset->mimeType,
      "originalFilename": asset->originalFilename
    }
  }
}`;

export const projectQuery = `*[_type == "project" && slug.current == $slug && published == true][0] {
  "slug": slug.current,
  title,
  summary,
  year,
  role,
  category,
  accent,
  order,
  featured,
  externalUrl,
  metrics,
  sections[]{
    eyebrow,
    title,
    body,
    tone,
    media[]{
      _type,
      alt,
      "url": asset->url,
      "mimeType": asset->mimeType,
      "originalFilename": asset->originalFilename
    }
  }
}`;

export const siteContentQuery = `{
  "settings": *[_type == "siteSettings"][0] {
    name,
    "shortRole": role,
    intro,
    email,
    social[]{"label": label, "href": url}
  },
  "about": *[_type == "about"][0] {
    "aboutHeadline": headline,
    bio,
    capabilities
  }
}`;
