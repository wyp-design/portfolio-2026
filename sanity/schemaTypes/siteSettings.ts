import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name / wordmark", type: "string" }),
    defineField({ name: "role", title: "Role", type: "localizedText" }),
    defineField({ name: "intro", title: "Hero introduction", type: "localizedTextBlock" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "domain", title: "Domain", type: "url" }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 3 }),
    defineField({ name: "socialImage", title: "Social share image", type: "image" }),
    defineField({
      name: "social",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "url", type: "url" }),
          ],
        }),
      ],
    }),
  ],
});

