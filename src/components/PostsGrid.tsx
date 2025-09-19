"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PostCard, type PostCardData } from "./PostCard";
import { StoryPlayer, type NewsStory } from "./StoryPlayer";
import { AppHeader } from "./AppHeader";
import { NewsModal } from "./NewsModal";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };

type CategoryOption = { value: string; label: string };

export function PostsGrid({ initialItems, initialPageInfo }: { initialItems: PostCardData[]; initialPageInfo: PageInfo }) {
  const [items, setItems] = useState<PostCardData[]>(initialItems);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [newsOpen, setNewsOpen] = useState(false);
  const [newsStory, setNewsStory] = useState<NewsStory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categoryOptions: CategoryOption[] = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (item.category?.slug && item.category?.name) {
        seen.set(item.category.slug, item.category.name);
      }
    }
    const sorted = Array.from(seen.entries())
      .map(([slug, name]) => ({ value: slug, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [{ value: "all", label: "Todas" }, ...sorted];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category?.slug === selectedCategory);
  }, [items, selectedCategory]);

  useEffect(() => {
    setOpen(false);
    setIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && pageInfo.hasNextPage && !loading) {
          void loadMore();
        }
      },
      { rootMargin: "800px 0px 800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageInfo.hasNextPage, loading]);

  async function loadMore() {
    if (!pageInfo.hasNextPage || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pageInfo.endCursor) params.set("after", pageInfo.endCursor);
      params.set("first", "9");
      const res = await fetch(`/api/posts?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { items: PostCardData[]; pageInfo: PageInfo };
      setItems((prev) => [...prev, ...json.items]);
      setPageInfo(json.pageInfo);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }

  const stories: NewsStory[] = useMemo(() => {
    return filteredItems.map((p) => {
      const fallbackScreen = {
        type: "text" as const,
        content: p.title,
        imageUrl: p.image || null,
      };
      const screens = p.acfScreens && p.acfScreens.length ? p.acfScreens : [fallbackScreen];
      return {
        id: p.id,
        title: p.title,
        subtitle: (p.excerpt || "").trim(),
        imageUrl: p.image || "",
        category: p.category?.name || "Geral",
        link: `https://portal.commarilia.com${p.uri}`,
        publishDate: p.date,
        excerpt: p.excerpt || null,
        contentHtml: p.contentHtml || null,
        screens,
      };
    });
  }, [filteredItems]);

  const grid = useMemo(
    () => (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((p, i) => (
          <PostCard
            key={p.id}
            post={p}
            priority={i < 3}
            onOpenStory={() => {
              setIndex(i);
              setOpen(true);
            }}
          />
        ))}
      </div>
    ),
    [filteredItems]
  );

  return (
    <div className="max-w-[990px] mx-auto px-4 lg:px-0 pt-4 pb-8 lg:pt-0">
      <AppHeader options={categoryOptions} selected={selectedCategory} onSelect={setSelectedCategory} />
      {grid}
      <div ref={sentinelRef} className="h-10" />
      {loading ? (
        <div className="mt-6 text-center text-sm text-neutral-500">Carregando mais...</div>
      ) : !pageInfo.hasNextPage ? (
        <div className="mt-6 text-center text-sm text-neutral-400">VocÃª chegou ao fim.</div>
      ) : null}
      {open && stories.length > 0 && (
        <StoryPlayer
          stories={stories}
          currentStoryIndex={index}
          onClose={() => setOpen(false)}
          onOpenNewsModal={(story) => {
            setNewsStory(story);
            setNewsOpen(true);
          }}
          onNext={() => setIndex((p) => Math.min(p + 1, stories.length - 1))}
          onPrevious={() => setIndex((p) => Math.max(p - 1, 0))}
        />
      )}

      <NewsModal story={newsStory} isOpen={newsOpen} onClose={() => setNewsOpen(false)} />
    </div>
  );
}






