"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2, X } from "lucide-react";

export function SallePhotosGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const preventSave = useCallback((e: React.MouseEvent) => e.preventDefault(), []);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const imgs = images.length > 0 ? images : ["/img.png"];
  const current = imgs[index] ?? imgs[0];

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? imgs.length - 1 : i - 1));
  }, [imgs.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= imgs.length - 1 ? 0 : i + 1));
  }, [imgs.length]);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setLightboxOpen(true);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 select-none" onContextMenu={preventSave}>
        {imgs.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => openAt(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 transition-opacity hover:opacity-95"
          >
            <Image
              src={src}
              alt={`${name} - Photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Lightbox plein écran (style image 3) */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black select-none"
          onContextMenu={preventSave}
        >
          {/* Barre supérieure : X Fermer | 1/20 | partage cœur */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
              Fermer
            </button>
            <p className="text-sm font-medium text-white/90">
              {index + 1} / {imgs.length}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  if (!navigator.share) return;
                  try {
                    await navigator.share({
                      title: name,
                      url: window.location.href,
                    });
                  } catch (err) {
                    if ((err as { name?: string }).name !== "AbortError") {
                      console.error("Share failed:", err);
                    }
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                aria-label="Partager"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                aria-label="Sauvegarder"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Zone image avec flèches */}
          <div className="relative flex flex-1 items-center justify-center p-4">
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>

            <div
              className="relative flex max-h-[calc(100vh-120px)] items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={name}
                className="max-h-[calc(100vh-120px)] w-auto max-w-full object-contain"
                draggable={false}
                onContextMenu={preventSave}
              />
            </div>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
              aria-label="Photo suivante"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
