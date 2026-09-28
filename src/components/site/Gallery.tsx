"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SiteImage } from "@/lib/data/media";

/**
 * Editorial gallery. Every image is a real <a href="original.jpg"><img></a>
 * in the server HTML (crawlable by Googlebot-Image, usable without JS);
 * JavaScript upgrades clicks into an accessible fullscreen lightbox.
 */
export function Gallery({ images, title }: { images: SiteImage[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setIndex(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [index, close, step]);

  if (!images.length) return null;
  const current = index !== null ? images[index] : null;

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
        {images.map((img, i) => {
          const wide = i % 3 === 0;
          return (
            <li key={img.id} className={wide ? "md:col-span-12" : "md:col-span-6"}>
              <figure>
                <a
                  href={img.url}
                  onClick={(e) => {
                    e.preventDefault();
                    lastTrigger.current = e.currentTarget;
                    setIndex(i);
                  }}
                  className={`group relative block overflow-hidden bg-bone ${wide ? "" : "md:aspect-[4/3]"}`}
                  aria-label={`Open image ${i + 1} of ${images.length}: ${img.alt}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    quality={75}
                    sizes={wide ? "(min-width: 1440px) 1330px, 100vw" : "(min-width: 768px) 50vw, 100vw"}
                    className={`h-auto w-full transition-transform duration-[1.2s] ease-[var(--ease-out-soft)] group-hover:scale-[1.02] ${wide ? "max-h-[88vh] object-cover" : "md:h-full md:object-cover"}`}
                  />
                </a>
                {img.caption ? (
                  <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">{img.caption}</figcaption>
                ) : null}
              </figure>
            </li>
          );
        })}
      </ul>

      {current ? (
        <div role="dialog" aria-modal="true" aria-label={`${title} — image ${index! + 1} of ${images.length}`} className="on-dark fixed inset-0 z-[70] flex flex-col bg-ink/97 text-white">
          <div className="flex items-center justify-between px-5 py-4 font-mono text-[12px] tracking-[0.14em]">
            <span>
              {index! + 1} / {images.length}
            </span>
            <button ref={closeRef} type="button" onClick={close} className="eyebrow flex h-11 items-center px-3 hover:underline">
              Close ✕
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution original in the lightbox */}
            <img src={current.url} alt={current.alt} width={current.width} height={current.height} className="max-h-full max-w-full object-contain" />
            {images.length > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/30 bg-ink/40 hover:bg-white hover:text-ink md:left-6">
                  ←
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/30 bg-ink/40 hover:bg-white hover:text-ink md:right-6">
                  →
                </button>
              </>
            ) : null}
          </div>
          <p className="px-5 py-5 text-center text-[14px] text-white/70">{current.caption || current.alt}</p>
        </div>
      ) : null}
    </>
  );
}
