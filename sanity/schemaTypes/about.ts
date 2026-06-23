import { defineArrayMember, defineField, defineType } from "sanity";

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({ name: "headline", title: "Headline", type: "localizedText" }),
    defineField({ name: "bio", title: "Biography", type: "localizedTextBlock" }),
    defineField({ name: "portrait", title: "Portrait", type: "image", options: { hotspot: true } }),
    defineField({
      name: "capabilities",
      title: "Capabilities",
      type: "array",
      of: [defineArrayMember({ type: "localizedText" })],
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "company", type: "string" }),
            defineField({ name: "role", type: "localizedText" }),
            defineField({ name: "period", type: "string" }),
          ],
        }),
      ],
    }),
  ],
});

