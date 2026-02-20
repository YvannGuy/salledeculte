"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const WORDS = [
  "événements cultuels",
  "cultes",
  "baptêmes",
  "conférences",
  "célébrations",
  "retraites",
  "concerts",
];

const INTERVAL_MS = 3000;

export function HeroRotatingTitle({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const word = WORDS[index];

  return (
    <h1
      className={cn(
        "max-w-[580px] text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[42px] lg:text-[56px]",
        className
      )}
    >
      Trouvez une salle adaptée pour vos{" "}
      <span
        key={index}
        className="inline-block animate-fade-in"
      >
        {word}
      </span>
    </h1>
  );
}
