import { gqlFetch } from "@/lib/graphql";
import { PostsGrid } from "@/components/PostsGrid";
import type { PostCardData } from "@/components/PostCard";

export const revalidate = 60;

type WPPost = {
  id: string;
  title: string;
  date: string;
  uri: string;
  content?: string | null;
  excerpt?: string | null;
  categories?: { nodes: Array<{ name: string; slug: string }> } | null;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
  storiesSimples?: {
    stories?: Array<{
      type?: string | null;
      title?: string | null;
      text?: string | null;
      showButton?: boolean | number | null;
      media?: (
        | { sourceUrl?: string | null; mimeType?: string | null; mediaItemUrl?: string | null }
        | {
            nodes?: Array<{ sourceUrl?: string | null; mimeType?: string | null; mediaItemUrl?: string | null }>;
            edges?: Array<{ node?: { sourceUrl?: string | null; mimeType?: string | null; mediaItemUrl?: string | null } }>;
          }
      ) | null;
    }> | null;
  } | null;
};

type WPPostsData = {
  posts: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    nodes: WPPost[];
  };
};

async function getInitial(): Promise<{ items: PostCardData[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }>
{
  const queryWithAcf = /* GraphQL */ `
    query HomeInitial($first: Int = 9) {
      posts(first: $first, where: { status: PUBLISH }) {
        pageInfo { endCursor hasNextPage }
        nodes {
          id
          title
          date
          uri
          excerpt
          content
          categories { nodes { name slug } }
          featuredImage { node { sourceUrl } }
          storiesSimples {
            stories {
              type
              title
              text
              showButton
              media {
                node { sourceUrl mimeType mediaItemUrl }
              }
            }
          }
        }
      }
    }
  `;

  const queryBase = /* GraphQL */ `
    query HomeInitialBase($first: Int = 9) {
      posts(first: $first, where: { status: PUBLISH }) {
        pageInfo { endCursor hasNextPage }
        nodes {
          id
          title
          date
          uri
          excerpt
          content
          categories { nodes { name slug } }
          featuredImage { node { sourceUrl } }
        }
      }
    }
  `;

  let data: WPPostsData;
  try {
    data = await gqlFetch<WPPostsData>(queryWithAcf, { first: 9 }, 60);
  } catch {
    data = await gqlFetch<WPPostsData>(queryBase, { first: 9 }, 60);
  }

  const items: PostCardData[] = data.posts.nodes.map((p) => {
    const html = (p.content || p.excerpt || "");
    const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const readingTimeMin = Math.max(1, Math.round(words / 200));
    const cleanExcerpt = (p.excerpt || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
    const dot = cleanExcerpt.indexOf(".");
    const excerpt = dot === -1 ? cleanExcerpt : cleanExcerpt.slice(0, dot + 1).trim();
    function pickMediaUrl(media: unknown): string | undefined {
      const m = media as {
        sourceUrl?: string | null;
        mediaItemUrl?: string | null;
        node?: { sourceUrl?: string | null; mediaItemUrl?: string | null };
        nodes?: Array<{ sourceUrl?: string | null; mediaItemUrl?: string | null }>;
        edges?: Array<{ node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } }>;
      } | null | undefined;
      if (!m) return undefined;
      if (m.node?.sourceUrl) return m.node.sourceUrl;
      if (m.node?.mediaItemUrl) return m.node.mediaItemUrl as string;
      if (typeof m.sourceUrl === "string" && m.sourceUrl) return m.sourceUrl;
      if (typeof m.mediaItemUrl === "string" && m.mediaItemUrl) return m.mediaItemUrl;
      if (Array.isArray(m.nodes) && m.nodes.length) {
        const n = m.nodes[0];
        if (n?.sourceUrl) return n.sourceUrl;
        if (n?.mediaItemUrl) return n.mediaItemUrl as string;
      }
      if (Array.isArray(m.edges) && m.edges.length) {
        const n = m.edges[0]?.node;
        if (n?.sourceUrl) return n.sourceUrl;
        if (n?.mediaItemUrl) return n.mediaItemUrl as string;
      }
      return undefined;
    }

    const acfScreens: PostCardData["acfScreens"] = Array.isArray(p.storiesSimples?.stories)
      ? p.storiesSimples!.stories!.map((s) => {
          const mediaUrl = pickMediaUrl(s?.media);
          const rawType: string = (s?.type || "text").toString().toLowerCase();
          const base = {
            type: "text" as const,
            slideTitle: (s?.title || null) as string | null,
            content: (s?.text || s?.title || "").toString().trim(),
            showButton: !!s?.showButton,
          };
          if (rawType === "video") {
            return { ...base, videoUrl: mediaUrl || null };
          }
          // image or text
          return { ...base, imageUrl: mediaUrl || null };
        })
      : null;


    return {
      id: p.id,
      title: p.title,
      date: p.date,
      uri: p.uri,
      category: p.categories?.nodes?.[0] || null,
      image: p.featuredImage?.node?.sourceUrl || null,
      readingTimeMin,
      excerpt,
      contentHtml: p.content || null,
      acfScreens,
    };
  });
  return { items, pageInfo: data.posts.pageInfo };
}

export default async function Home() {
  let initial: { items: PostCardData[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } = {
    items: [],
    pageInfo: { endCursor: null, hasNextPage: false },
  };
  try {
    initial = await getInitial();
  } catch {
    // keep minimal render on error
  }

  return <PostsGrid initialItems={initial.items} initialPageInfo={initial.pageInfo} />;
}
