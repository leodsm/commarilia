import Image from "next/image";
import Link from "next/link";
import type { PostCardData } from "./PostCard";

export function PostCardCompact({ post }: { post: PostCardData }) {
  const href = `https://portal.commarilia.com${post.uri}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden border bg-white hover:shadow-lg transition-shadow"
      aria-label={`Abrir: ${post.title}`}
    >
      <div className="relative w-full aspect-[4/3]">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-neutral-200" />
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-2">{post.title}</h3>
        {post.excerpt ? (
          <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{post.excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}

export default PostCardCompact;
