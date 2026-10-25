import type { Collection } from "tinacms";
import { youTubeEmbedTemplate } from "../../src/components/mdx/YouTubeEmbed.template";
import { seoFields } from "../fields/seo";
import { viewFrontendField } from "../fields/view-frontend";

// Tina's generated SDK does not support a list-valued reference field, while
// the cloud indexer cannot seed references nested under a repeatable object.
// Ordered scalar references preserve native relationships and deterministic
// multi-category display order on both local and cloud indexes.
const categoryRelationshipFields = Array.from({ length: 16 }, (_, index) => ({
  name: `category${String(index + 1).padStart(2, "0")}`,
  label: `Category ${index + 1}`,
  type: "reference" as const,
  collections: ["category"],
}));
function slugifyFilename(value?: string | null): string {
  if (!value || typeof value !== "string") return "untitled";
  let input = value.trim().toLowerCase();
  if (!input) return "untitled";
  if (input.startsWith("http://") || input.startsWith("https://")) input = input.split("/").slice(3).join("/");
  input = input.split("?")[0].split("#")[0].split("\\").join("/");
  while (input.startsWith("/")) input = input.slice(1);
  while (input.endsWith("/")) input = input.slice(0, -1);
  if (input.startsWith("blog/")) input = input.slice(5);
  let output = "";
  let lastWasDash = false;
  for (const ch of input) {
    const isLetter = ch >= "a" && ch <= "z";
    const isNumber = ch >= "0" && ch <= "9";
    const isSlash = ch === "/";
    const isAllowed = isLetter || isNumber || isSlash || ch === "-" || ch === "_" || ch === ".";
    if (isAllowed) { output += ch; lastWasDash = false; }
    else if (!lastWasDash) { output += "-"; lastWasDash = true; }
  }
  while (output.startsWith("-")) output = output.slice(1);
  while (output.endsWith("-")) output = output.slice(0, -1);
  while (output.includes("//")) output = output.split("//").join("/");
  return output || "untitled";
}

function cleanPublicSlug(value?: string | null): string {
  if (!value || typeof value !== "string") return "";
  let input = value.trim().toLowerCase();
  if (!input || input === "untitled") return "";

  if (input.startsWith("http://") || input.startsWith("https://")) {
    const parts = input.split("/");
    input = parts.slice(3).join("/");
  }

  input = input.split("?")[0].split("#")[0];
  input = input.split("\\").join("/");
  while (input.startsWith("/")) input = input.slice(1);
  while (input.endsWith("/")) input = input.slice(0, -1);
  while (input.includes("//")) input = input.split("//").join("/");
  return input;
}

function filenameFromDocument(document: any): string {
  return cleanPublicSlug(document?._sys?.filename || document?._sys?.basename || "");
}

export const BlogCollection: Collection = {
  name: "blog",
  label: "Blogs",
  path: "src/content/blog",
  format: "mdx",
  ui: {
    filename: {
      readonly: false,
      parse: (filename) => slugifyFilename(filename),
      slugify: (values) => slugifyFilename(values?.title || "untitled"),
    },
    router: ({ document }) => {
      const raw = cleanPublicSlug((document as any)?.permalink) || filenameFromDocument(document);
      const normalized = slugifyFilename(raw).split("/").map((part) => part.replace(/[_.]+/g, "-")).filter(Boolean).join("/");
      const slug = normalized.startsWith("blog/") ? normalized.slice(5) : normalized;
      return slug ? "/" + slug + "/" : "/blog/";
    },
  },
  fields: [
    viewFrontendField("blog"),
    { type: "string", name: "title", label: "Title", isTitle: true, required: true },
    { name: "permalink", label: "Permalink", type: "string", description: "Optional custom public URL path. Leave blank to use the filename/slug." },

    { name: "description", label: "Description", type: "string" },
    { name: "draft", label: "Draft (hide from the public site)", type: "boolean", description: "Enable while this post is not ready to publish." },
    seoFields,
    { name: "pubDate", label: "Publication Date", type: "datetime" },
    { name: "updatedDate", label: "Updated Date", type: "datetime" },
    { name: "readTime", label: "Read Time", type: "string", description: "Example: 7 min read" },
    ...categoryRelationshipFields,

    {
      name: "author",
      label: "Author / User",
      type: "reference",
      collections: ["user"],
      description: "Assign this post to a user profile, similar to a WordPress post author.",
    },
    { name: "heroImage", label: "Hero Image", type: "image" },
    { name: "authorAlt", label: "Author Alt Text", type: "string", description: "Alt text for the author image." },
    { name: "heroImageAlt", label: "Hero Image Alt Text", type: "string", description: "Alt text for the hero image." },
    { type: "rich-text", name: "body", label: "Body", isBody: true, templates: [youTubeEmbedTemplate] },
  ],
};