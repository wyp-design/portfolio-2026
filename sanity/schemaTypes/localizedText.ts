import { defineField, defineType } from "sanity";

export const localizedText = defineType({
  name: "localizedText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "zh", title: "中文", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "en", title: "English", type: "string", validation: (rule) => rule.required() }),
  ],
});

export const localizedTextBlock = defineType({
  name: "localizedTextBlock",
  title: "Localized paragraph",
  type: "object",
  fields: [
    defineField({ name: "zh", title: "中文", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "en", title: "English", type: "text", rows: 4, validation: (rule) => rule.required() }),
  ],
});

