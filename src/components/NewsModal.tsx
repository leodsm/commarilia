/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect } from "react";
import type { NewsStory } from "./StoryPlayer";

function ImageWithFallback({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  const [err, setErr] = React.useState(false);
  const url = err || !src ? "https://images.unsplash.com/photo-1545972152-7051c7c4e9f5?q=80&w=1200&auto=format&fit=crop" : src;
  return <img src={url || undefined} alt={alt || ""} className={className} onError={() => setErr(true)} />;
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 11v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}


function formatDate(dateString?: string) {
  if (!dateString) return "";
  const now = new Date();
  const publishDate = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - publishDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

  if (diffDays <= 7) {
    if (diffDays === 0) {
      if (diffHours === 0) {
        return "postado ha poucos minutos";
      } else if (diffHours === 1) {
        return "postado ha 1 hora";
      } else {
        return `postado ha ${diffHours} horas`;
      }
    } else if (diffDays === 1) {
      return "postado ha 1 dia";
    } else {
      return `postado ha ${diffDays} dias`;
    }
  } else {
    return publishDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export function NewsModal({ story, isOpen, onClose }: { story: NewsStory | null; isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleShare = useCallback(() => {
    if (!story) return;
    const shareUrl = story.link || (typeof window !== "undefined" ? window.location.href : "");
    if (!shareUrl) return;
    const shareData = {
      title: story.title,
      text: story.subtitle || story.excerpt || story.title,
      url: shareUrl,
    };
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      navigator.share(shareData).catch(() => {});
    } else if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }, [story]);

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="relative max-w-3xl w-[92%] max-h-[90vh] overflow-y-auto rounded-2xl bg-white text-neutral-900 shadow-2xl">
        {/* Header image */}
        <div className="relative h-56 w-full">
          <ImageWithFallback src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            type="button"
            aria-label="Compartilhar noticia"
            onClick={handleShare}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-neutral-700 shadow-md transition hover:bg-white hover:text-neutral-900"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date */}
          <div className="mb-3 text-sm text-neutral-500 flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
            <span>{formatDate(story.publishDate)}</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold leading-tight mb-2 text-neutral-900">{story.title}</h2>
          {story.subtitle ? (
            <p className="text-base mb-5 text-neutral-600">{story.subtitle}</p>
          ) : story.excerpt ? (
            <p className="text-base mb-5 text-neutral-600">{story.excerpt}</p>
          ) : null}

          {/* Content */}
          {story.contentHtml ? (
            <div className="mb-6 text-[15px] leading-7 text-neutral-800 space-y-4">
              <div
                className="[&>p]:mb-4 [&>p:last-child]:mb-0 [&_img]:max-w-full [&_img]:h-auto [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2"
                dangerouslySetInnerHTML={{ __html: story.contentHtml }}
              />
            </div>
          ) : null}

        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="fixed bottom-6 left-1/2 z-[70] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/80 text-neutral-600 shadow-lg transition hover:bg-white hover:text-neutral-900"
      >
        <span className="text-2xl leading-none">&times;</span>
      </button>
    </div>
  );
}

export default NewsModal;






