import sanitizeHtml from "sanitize-html";

/**
 * Whitelist sanitiser for CMS rich text. Runs on save AND on render.
 * - no inline styles, scripts, iframes, event handlers or data: URLs
 * - images only from our own /media/ storage
 * - external links get rel="noopener noreferrer" and open in a new tab
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption", "code", "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  // Headings: the page owns the single H1 — demote any h1 coming from the editor.
  transformTags: {
    h1: "h2",
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?symc\.com\.tr/i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : { href, ...(attribs.title ? { title: attribs.title } : {}) },
      };
    },
  },
  exclusiveFilter: (frame) => frame.tag === "img" && !/^\/media\/[a-z0-9\-/]+\.(jpg|png|webp|avif|gif)$/.test(frame.attribs.src ?? ""),
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? "", OPTIONS).trim();
}

/** Plain text (for descriptions / excerpts / JSON-LD). */
export function htmlToText(html: string): string {
  return sanitizeHtml(html ?? "", { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}
