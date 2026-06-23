import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({ name: "title", title: "Title", type: "localizedText", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "summary", title: "Summary", type: "localizedTextBlock", validation: (rule) => rule.required() }),
    defineField({ name: "year", title: "Year", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", title: "Role", type: "localizedText" }),
    defineField({ name: "category", title: "Category", type: "localizedText" }),
    defineField({ name: "cover", title: "Cover image", type: "image", options: { hotspot: true } }),
    defineField({ name: "accent", title: "Accent color", type: "string", initialValue: "#5dd8ff" }),
    defineField({ name: "order", title: "Fallback order", type: "number", initialValue: 0 }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
    defineField({ name: "published", title: "Visible on site", type: "boolean", initialValue: true }),
    defineField({ name: "externalUrl", title: "External URL", type: "url" }),
    defineField({
      name: "metrics",
      title: "Metrics",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Value", type: "string" }),
            defineField({ name: "label", title: "Label", type: "localizedText" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "sections",
      title: "Project sections",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "eyebrow", title: "Section label", type: "localizedText" }),
            defineField({ name: "title", title: "Section title", type: "localizedText" }),
            defineField({ name: "body", title: "Body", type: "localizedTextBlock" }),
            defineField({
              name: "tone",
              title: "Color tone",
              type: "string",
              options: {
                list: [
                  { title: "Light", value: "light" },
                  { title: "Dark", value: "dark" },
                  { title: "Blue", value: "blue" },
                  { title: "Lime", value: "lime" },
                ],
              },
            }),
            defineField({
              name: "media",
              title: "Media",
              type: "array",
              of: [
                defineArrayMember({
                  type: "image",
                  options: { hotspot: true },
                  fields: [defineField({ name: "alt", title: "Alt text", type: "localizedText" })],
                }),
                defineArrayMember({ type: "file", options: { accept: "image/gif,application/pdf,video/*" } }),
              ],
            }),
          ],
          preview: { select: { title: "title.zh", subtitle: "eyebrow.en" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title.zh", subtitle: "title.en", media: "cover" },
  },
});
