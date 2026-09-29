"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Number that counts up once when it scrolls into view. The server HTML always
 * contains the final value (crawlers, no-JS, reduced motion); only numeric
 * values below the fold are animated.
 */
export function StatCounter({ value }: { value: string }) {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (target === null || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already visible: no jump
    // Year-like values count from a nearby start so "2020" does not spin from 0.
    const from = target >= 1000 ? target - 20 : 0;
    setDisplay(from);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(from + (target - from) * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <span ref={ref}>
      {display === null ? value : `${display}${suffix}`}
    </span>
  );
}
