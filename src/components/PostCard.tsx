import Image from "next/image";
import Link from "next/link";
import { categoryColorHex } from "@/lib/categoryColors";
import type { StoryScreen } from "./StoryPlayer";

export type PostCardData = {
  id: string;
  title: string;
  date: string; // ISO
  uri: string; // e.g., /post-slug/
  image: string | null;
  readingTimeMin: number;
  category: { name: string; slug: string } | null;
  excerpt?: string | null;
  // Optional: full content (HTML) if available
  contentHtml?: string | null;
  // Optional: stories from ACF (already mapped to player shape)
  acfScreens?: StoryScreen[] | null;
};

export function PostCard({ post, onOpenStory, priority = false }: { post: PostCardData; onOpenStory?: () => void; priority?: boolean }) {
  const href = `https://portal.commarilia.com${post.uri}`;
  const ariaLabel = `Leia: ${post.title}`;

  function handleClick(e: React.MouseEvent) {
    if (onOpenStory) {
      e.preventDefault();
      onOpenStory();
    }
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={handleClick}
      className="group relative block rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40 transition-transform duration-200 hover:-translate-y-0.5 md:hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[3/4]">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 skeleton" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80" />

        {/* Text block */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <span
            className={`inline-block text-white text-[11px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-2`}
            style={{ backgroundColor: categoryColorHex(post.category?.name, post.category?.slug) }}
          >
            {post.category?.name ?? "Uncategorized"}
          </span>
          <h3 className="font-poppins font-bold text-[16px] leading-[1.18] break-words">
            {post.title}
          </h3>
          {(() => {
            const t = (post.excerpt || "").trim();
            if (!t) return null;
            const idx = t.indexOf(".");
            const shown = idx === -1 ? t : t.slice(0, idx + 1).trim();
            return (
              <p className="mt-2 text-white/90 text-[14px] leading-[1.35] break-words line-clamp-2">{shown}</p>
            );
          })()}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;

