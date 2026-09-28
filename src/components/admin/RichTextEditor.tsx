"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";
import { MediaPickerDialog } from "./MediaPicker";

/**
 * Tiptap editor restricted to the same whitelist the server sanitiser allows
 * (paragraphs, H2–H4, lists, quotes, links, library images). The HTML is
 * posted in a hidden field and sanitised again on the server before saving.
 */
export function RichTextEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [picking, setPicking] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, codeBlock: false, link: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"] }),
      Image.configure({ inline: false }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "rich-text min-h-[260px] px-4 py-3 outline-none", "aria-label": "Content" },
    },
    onUpdate: ({ editor: e }) => setHtml(e.isEmpty ? "" : e.getHTML()),
  });

  const btn = (active: boolean) =>
    `rounded-[2px] px-2.5 py-1 text-[12px] font-semibold ${active ? "bg-ink text-white" : "text-[#3b4650] hover:bg-[#eef1f3]"}`;

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://… or /internal-page/)", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rounded-[2px] border border-[#cfd5db] bg-white focus-within:border-sea">
      <div className="flex flex-wrap gap-1 border-b border-[#e6eaed] p-1.5" role="toolbar" aria-label="Formatting">
        <button type="button" className={btn(!!editor?.isActive("heading", { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={btn(!!editor?.isActive("heading", { level: 3 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" className={btn(!!editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" className={btn(!!editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" className={btn(!!editor?.isActive("bulletList"))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={btn(!!editor?.isActive("orderedList"))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={btn(!!editor?.isActive("blockquote"))} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button>
        <button type="button" className={btn(!!editor?.isActive("link"))} onClick={setLink}>Link</button>
        <button type="button" className={btn(false)} onClick={() => setPicking(true)}>Image</button>
        <button type="button" className={btn(false)} onClick={() => editor?.chain().focus().undo().run()}>Undo</button>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
      {picking ? (
        <MediaPickerDialog
          onClose={() => setPicking(false)}
          onSelect={(m) => {
            editor?.chain().focus().setImage({ src: m.url, alt: m.alt, title: m.caption || undefined }).run();
            setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}
