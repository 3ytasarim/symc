import { sanitizeRichText } from "@/lib/content/sanitize";

/** Renders CMS HTML — sanitised again at render time as defence in depth. */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
