"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { SiteImage } from "@/lib/data/media";

export type Slide = {
  title: string;
  subtitle: string;
  image: SiteImage | null;
  href: string;
  cta: string;
};

/**
 * Homepage hero slider (Norm Yacht pattern). The first slide is server-rendered
 * with a high-priority image (LCP); the heading stays stable across slides.
 */
export function HeroSlider({ slides, heading }: { slides: Slide[]; heading: string }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const count = slides.length;

  const go = useCallback((i: number) => setCurrent((i + count) % count), [count]);

  useEffect(() => {
    if (!playing || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      return;
    }
    const t = setInterval(() => setCurrent((p) => (p + 1) % count), 6000);
    return () => clearInterval(t);
  }, [playing, count]);

  if (!count) return null;
  const slide = slides[current] ?? slides[0]!;

  return (
    <section
      className="on-dark relative isolate h-[560px] overflow-hidden bg-deep text-white md:h-[640px]"
      aria-roledescription="carousel"
      aria-label="Highlights"
    >
      {slides.map((s, i) =>
        s.image ? (
          <div
            key={s.href + i}
            aria-hidden={i !== current}
            className={`absolute inset-0 -z-20 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.image.url}
              alt={i === 0 ? s.image.alt : ""}
              fill
              sizes="100vw"
              quality={80}
              className="object-cover"
              {...(i === 0 ? { priority: true, fetchPriority: "high" as const } : { loading: "lazy" as const })}
            />
          </div>
        ) : null,
      )}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-deep/90 via-deep/60 to-black/20" />

      <div className="shell relative flex h-full items-center">
        <div className="max-w-2xl" aria-live={playing ? "off" : "polite"}>
          <h1 className="eyebrow mb-4 text-gold">{heading}</h1>
          <p key={`t-${current}`} className="animate-slide-up mb-5 text-3xl font-black leading-tight md:text-4xl lg:text-5xl">
            {slide.title}
          </p>
          {slide.subtitle ? (
            <p key={`s-${current}`} className="animate-slide-up-delay mb-8 max-w-xl text-base leading-relaxed text-neutral-200 md:text-lg">
              {slide.subtitle}
            </p>
          ) : null}
          <Link key={`c-${current}`} href={slide.href} className="btn-solid animate-slide-up-delay-2 group h-12 px-8">
            {slide.cta}
            <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-6 z-10">
          <div className="shell flex items-center gap-4">
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.href + i}
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    go(i);
                  }}
                  aria-label={`Show slide ${i + 1}: ${s.title}`}
                  aria-current={i === current ? "true" : undefined}
                  className="flex h-6 items-center"
                >
                  <span className={`block h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-gold" : "w-3 bg-white/50 hover:bg-white/80"}`} />
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-gold"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current - 1);
                }}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-gold"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  go(current + 1);
                }}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-gold"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
