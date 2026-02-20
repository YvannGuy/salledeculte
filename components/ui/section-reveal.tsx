"use client";

import { useEffect, useRef, useState } from "react";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

export function SectionReveal({ children, className = "", id, delay = 0 }: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            timeoutId = setTimeout(() => setVisible(true), delay);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.1 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return (
    <section
      ref={ref}
      id={id}
      className={`section-reveal ${visible ? "section-reveal--visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
