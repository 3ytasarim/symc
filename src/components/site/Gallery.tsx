"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { SiteImage } from "@/lib/data/media";

/**
 * Image carousel with thumbnails and a fullscreen lightbox (Norm Yacht pattern).
 * Every thumbnail is a real <a href="original.jpg"><img></a> in the server HTML,
 * so all images stay crawlable and usable without JavaScript.
 */
export function Gallery({
  images,
  title,
  height = "h-[320px] sm:h-[420px] md:h-[500px]",
  priority = false,
}: {
  images: SiteImage[];
  title: string;
  height?: string;
  /** The first image is the page's LCP element (detail pages). */
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [auto, setAuto] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const step = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);
  const go = (i: number) => {
    setAuto(false);
    setIndex(i);
  };

  useEffect(() => {
    if (!auto || count <= 1 || lightbox) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => step(1), 4000);
    return () => clearInterval(t);
  }, [auto, count, lightbox, step]);

  useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [lightbox, step]);

  if (!count) return null;
  const current = images[index] ?? images[0]!;

  return (
    <div>
      <div className={`group relative overflow-hidden rounded-lg bg-neutral-100 ${height}`}>
        <button
          type="button"
          onClick={() => {
            setAuto(false);
            setLightbox(true);
          }}
          className="absolute inset-0 block h-full w-full cursor-zoom-in"
          aria-label={`Enlarge image ${index + 1} of ${count}: ${current.alt}`}
        >
          <Image
            key={current.id}
            src={current.url}
            alt={current.alt}
            fill
            sizes="(min-width: 1024px) 800px, 100vw"
            quality={80}
            className={index === 0 ? "object-contain" : "animate-fade object-contain"}
            {...(priority && index === 0 ? { priority: true, fetchPriority: "high" as const } : {})}
          />
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <ZoomIn className="h-10 w-10 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
          </span>
        </button>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => {
                setAuto(false);
                step(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setAuto(false);
                step(1);
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
              {images.map((img, i) => (
                <span key={img.id} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold" : "w-2 bg-white/60"}`} />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {current.caption ? <p className="mt-2 text-xs text-neutral-500">{current.caption}</p> : null}

      {count > 1 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <li key={img.id}>
              <a
                href={img.url}
                onClick={(e) => {
                  e.preventDefault();
                  go(i);
                }}
                aria-label={`Show image ${i + 1} of ${count}: ${img.alt}`}
                aria-current={i === index ? "true" : undefined}
                className={`relative block h-14 w-20 overflow-hidden rounded-md border-2 transition-all ${
                  i === index ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt={img.alt} fill sizes="80px" quality={70} loading="lazy" className="object-cover" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image ${index + 1} of ${count}`}
          className="on-dark fixed inset-0 z-[70] flex flex-col bg-black/95 text-white"
          onClick={() => setLightbox(false)}
        >
          <div className="flex items-center justify-between px-5 py-4 text-sm" onClick={(e) => e.stopPropagation()}>
            <span className="font-semibold">
              {index + 1} / {count}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- full-resolution original in the lightbox */}
            <img src={current.url} alt={current.alt} width={current.width} height={current.height} className="max-h-full max-w-full object-contain" />
            {count > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold md:left-6">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-gold md:right-6">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
          <p className="px-5 py-5 text-center text-sm text-white/70">{current.caption || current.alt}</p>
        </div>
      ) : null}
    </div>
  );
}
