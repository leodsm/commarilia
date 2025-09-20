/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import type { SwipeableHandlers } from "react-swipeable";
import { categoryColorHex } from "@/lib/categoryColors";

export type StoryScreen = {
  type?: "text" | "quote" | "image" | "video";
  content?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  slideTitle?: string | null;
  showButton?: boolean | null;
  quote?: string;
  author?: string;
};

export type NewsStory = {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  category: string;
  screens: StoryScreen[];
  link?: string;
  contentHtml?: string | null;
  publishDate?: string;
  excerpt?: string | null;
};

type TransitionDirection = "forward" | "backward" | "idle";

function Button({
  children,
  className = "",
  onClick,
  variant = "ghost",
  size = "md",
}: React.PropsWithChildren<{ className?: string; onClick?: React.MouseEventHandler; variant?: "ghost" | "solid"; size?: "md" | "icon" }>) {
  const base = "inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const sizes = size === "icon" ? "h-10 w-10" : "h-10 px-4";
  const styles = variant === "solid" ? "bg-white text-black hover:opacity-90" : "text-white border border-white/30 hover:bg-white hover:text-black";
  return (
    <button className={`${base} ${sizes} ${styles} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function ImageWithFallback({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [err, setErr] = useState(false);
  const url = err || !src ? "https://images.unsplash.com/photo-1545972152-7051c7c4e9f5?q=80&w=1200&auto=format&fit=crop" : src;
  return <img src={url} alt={alt || ""} className={className} onError={() => setErr(true)} />;
}

export function StoryPlayer({
  stories,
  currentStoryIndex,
  onClose,
  onOpenNewsModal,
  onNext,
  onPrevious,
}: {
  stories: NewsStory[];
  currentStoryIndex: number;
  onClose: () => void;
  onOpenNewsModal: (story: NewsStory) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentStory = stories[currentStoryIndex];
  const totalScreens = currentStory?.screens?.length || 0;
  const currentScreen = totalScreens > 0 ? currentStory?.screens?.[Math.min(currentScreenIndex, totalScreens - 1)] : undefined;
  const isVideo = !!currentScreen?.videoUrl;
  const isFirstScreen = currentScreenIndex === 0;
  const slideTitleText = currentScreen?.slideTitle?.trim() ?? "";
  const rawSlideBodyText = currentScreen?.content?.trim() ?? "";
  const slideTextsEqual =
    slideTitleText.length > 0 && rawSlideBodyText.length > 0 && slideTitleText.toLowerCase() === rawSlideBodyText.toLowerCase();
  const slideBodyText = slideTextsEqual ? "" : rawSlideBodyText;
  const hasSlideTitle = slideTitleText.length > 0;
  const hasSlideBody = slideBodyText.length > 0;
  const showSlideButton = !!currentScreen?.showButton;

  const goToScreen = useCallback(
    (resolver: number | ((prev: number) => number), options?: { animate?: boolean }) => {
      const shouldAnimate = options?.animate ?? true;
      setCurrentScreenIndex((prev) => {
        const rawNext = typeof resolver === "function" ? resolver(prev) : resolver;
        const clamped =
          totalScreens > 0 ? Math.max(0, Math.min(totalScreens - 1, rawNext)) : 0;
        if (clamped !== prev) {
          setTransitionDirection(shouldAnimate ? (clamped > prev ? "forward" : "backward") : "idle");
        }
        return clamped;
      });
    },
    [totalScreens]
  );

  useEffect(() => {
    setTransitionDirection("idle");
    goToScreen(0, { animate: false });
  }, [currentStoryIndex, goToScreen]);

  // Lock background scroll while StoryPlayer is open
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const prevOverscroll = html.style.overscrollBehavior;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowUp":
          e.preventDefault();
          if (currentStoryIndex > 0) onPrevious();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentStoryIndex < stories.length - 1) onNext();
          else onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentScreenIndex > 0) goToScreen((prev) => prev - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentStory && currentScreenIndex < totalScreens - 1) goToScreen((prev) => prev + 1);
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious, currentStory, currentScreenIndex, currentStoryIndex, stories, totalScreens, goToScreen]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        if (currentStoryIndex < stories.length - 1) onNext();
        else onClose();
      } else {
        if (currentStoryIndex > 0) onPrevious();
      }
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel as EventListener);
  }, [currentStoryIndex, stories, onNext, onPrevious, onClose]);

  // Auto-avanca video ao terminar
  useEffect(() => {
    if (!isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (currentScreenIndex < totalScreens - 1) goToScreen((prev) => prev + 1);
      else onNext();
    };
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("ended", onEnded);
    };
  }, [isVideo, currentScreenIndex, totalScreens, onNext, goToScreen]);



  useEffect(() => {
    const next = stories[currentStoryIndex + 1];
    if (!next) return;
    const list = [next.imageUrl, ...(next.screens?.map((s) => s.imageUrl).filter(Boolean) as string[])];
    list.slice(0, 2).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [currentStoryIndex, stories]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX || !startY) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const min = 50;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > min) {
      if (deltaY > 0) {
        if (currentStoryIndex > 0) onPrevious();
        else onClose();
      } else {
        if (currentStoryIndex < stories.length - 1) onNext();
        else onClose();
      }
      return;
    }
    if (Math.abs(deltaX) > min) {
      if (deltaX > 0) {
        if (currentScreenIndex > 0) goToScreen((prev) => prev - 1);
      } else {
        if (currentStory && currentScreenIndex < currentStory.screens.length - 1) goToScreen((prev) => prev + 1);
      }
    }
    setStartX(0);
    setStartY(0);
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const w = rect.width;
    if (x < w / 3) {
      if (currentScreenIndex > 0) goToScreen((prev) => prev - 1);
    } else if (x > (2 * w) / 3) {
      if (currentStory && currentScreenIndex < totalScreens - 1) goToScreen((prev) => prev + 1);
    }
  };

  // Swipe handlers (robust cross-browser)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentStory && currentScreenIndex < totalScreens - 1) goToScreen((prev) => prev + 1);
    },
    onSwipedRight: () => {
      if (currentScreenIndex > 0) goToScreen((prev) => prev - 1);
    },
    onSwipedUp: () => {
      if (currentStoryIndex < stories.length - 1) onNext(); else onClose();
    },
    onSwipedDown: () => {
      if (currentStoryIndex > 0) onPrevious();
      else onClose();
    },
    delta: 50,
    trackTouch: true,
    trackMouse: false,
    preventScrollOnSwipe: true,
  });
  const { ref: swipeableRef, ...swipeableHandlers } = swipeHandlers as SwipeableHandlers & Record<string, unknown>;

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      <div className="flex items-center justify-center w-full h-full">
        <div
          ref={(el) => {
            containerRef.current = el;
            if (typeof swipeableRef === "function") {
              swipeableRef(el);
            }
          }}
          className="swiper-main-wrapper w-full h-full max-w-[450px] relative overflow-hidden rounded-none md:rounded-[2rem] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:aspect-[9/16] md:h-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
          {...swipeableHandlers}
        >
          {/* Invisible tap hotspots to guarantee lateral navigation even over content */}
          {totalScreens > 1 && (
            <>
              <div
                className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentScreenIndex > 0) goToScreen((prev) => prev - 1);
                }}
              />
              <div
                className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentStory && currentScreenIndex < totalScreens - 1) goToScreen((prev) => prev + 1);
                }}
              />
            </>
          )}

          <div className="news-card h-full w-full">
            <div
              key={`${currentStory.id}-${currentScreenIndex}`}
              className="slide-transition relative flex flex-1 h-full w-full flex-col"
              data-transition={transitionDirection}
            >
              {currentScreen?.videoUrl ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  src={currentScreen.videoUrl}
                  playsInline
                  muted
                  autoPlay
                  preload="metadata"
                />
              ) : (
                <ImageWithFallback
                  src={currentScreen?.imageUrl || currentStory.imageUrl}
                  alt={currentScreen?.content}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}

              <div className="news-content">
                <div className="w-full max-w-3xl h-full flex flex-col">
                  {isFirstScreen ? (
                    <div className="mt-auto space-y-4 text-left">
                      <div className="space-y-2">
                        <span
                          className={`text-white text-xs font-bold px-3 py-1 rounded-full inline-block uppercase tracking-widest`}
                          style={{ backgroundColor: categoryColorHex(currentStory.category) }}
                        >
                          {currentStory.category}
                        </span>
                        <h1 className="text-2xl md:text-2xl lg:text-3xl font-black leading-snug drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]">
                          {currentStory.title}
                        </h1>
                        {currentStory.subtitle ? (
                          <p className="text-base opacity-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{currentStory.subtitle}</p>
                        ) : null}
                      </div>
                      {showSlideButton ? (
                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            className="text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNewsModal(currentStory);
                            }}
                          >
                            Leia Mais
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {!isFirstScreen && currentScreen && (
                    <div className="mt-auto space-y-3 text-left">
                      {hasSlideTitle ? (
                        <h2 className="text-2xl md:text-3xl font-black leading-tight drop-shadow-[0_3px_8px_rgba(0,0,0,0.45)]">{slideTitleText}</h2>
                      ) : null}
                      {currentScreen.type !== "quote" && hasSlideBody ? (
                        <p className="text-base text-white/80 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{slideBodyText}</p>
                      ) : null}
                      {currentScreen.type === "quote" && currentScreen.quote ? (
                        <>
                          <div className="text-4xl mb-4">&quot;</div>
                          <p className="text-xl mb-4 italic drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{currentScreen.quote}</p>
                          <p className="text-sm opacity-75 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"> {currentScreen.author}</p>
                        </>
                      ) : null}
                      {showSlideButton ? (
                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            className="text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNewsModal(currentStory);
                            }}
                          >
                            Leia Mais
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Vertical bullets */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
            {(() => {
              const maxBullets = 5;
              const total = stories.length;
              if (total <= maxBullets) {
                return stories.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 rounded-full transition-all duration-300 ${index === currentStoryIndex ? "h-6" : "h-2"}`}
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                      backgroundColor: "#ffffff",
                      opacity: index === currentStoryIndex ? 1 : index < currentStoryIndex ? 0.7 : 0.3,
                    }}
                  />
                ));
              } else {
                const startIndex = Math.max(0, Math.min(currentStoryIndex - 2, total - maxBullets));
                return Array.from({ length: maxBullets }, (_, i) => {
                  const storyIndex = startIndex + i;
                  return (
                    <div
                      key={storyIndex}
                      className={`w-2 rounded-full transition-all duration-300 ${storyIndex === currentStoryIndex ? "h-6" : "h-2"}`}
                      style={{
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                        backgroundColor: "#ffffff",
                        opacity: storyIndex === currentStoryIndex ? 1 : storyIndex < currentStoryIndex ? 0.7 : 0.3,
                      }}
                    />
                  );
                });
              }
            })()}
          </div>
          {/* Slide dots */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center space-x-2 z-40">
            {(currentStory.screens || []).map((_, index) => {
              const isActive = index === currentScreenIndex;
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir para o slide ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToScreen(index);
                  }}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${isActive ? "transform scale-110 bg-white shadow-[0_0_0_2px_rgba(15,23,42,0.45)]" : "bg-white/40 hover:bg-white/70"}`}
                />
              );
            })}
          </div>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-8 right-4 z-50 text-white border-0 focus:ring-0 focus:ring-offset-0"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Lightweight Stories launcher that fetches WP posts and opens the player

















