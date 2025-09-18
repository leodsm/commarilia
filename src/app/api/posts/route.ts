import { NextRequest } from "next/server";
import { gqlFetch } from "@/lib/graphql";

// Force this route to be dynamic and never cached
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type WPMediaLike =
  | { sourceUrl?: string | null; mediaItemUrl?: string | null }
  | { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } }
  | { nodes?: Array<{ sourceUrl?: string | null; mediaItemUrl?: string | null }> }
  | { edges?: Array<{ node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } }> }
  | Array<{ sourceUrl?: string | null; mediaItemUrl?: string | null }>
  | string
  | null
  | undefined;

type WPPost = {
  id: string;
  title: string;
  date: string;
  uri: string;
  excerpt?: string | null;
  content?: string | null;
  categories?: { nodes: Array<{ name: string; slug: string }> } | null;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
  storiesSimples?: {
    stories?: Array<{
      type?: string | null;
      title?: string | null;
      text?: string | null;
      showButton?: boolean | number | null;
      media?: WPMediaLike;
    }> | null;
  } | null;
};

type WPPostsData = {
  posts: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    nodes: WPPost[];
  };
};

// --- Utils ---
function stripHtml(html?: string | null): string {
  if (!html) return "";
  const noTags = html.replace(/<[^>]*>/g, " ");
  return noTags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Aceita varios formatos de `media` (objeto unico, array, nodes/edges, string) e retorna a melhor URL. */
function pickMediaUrl(media: WPMediaLike): string | undefined {
  if (!media) return undefined;

  if (typeof media === "string") return media || undefined;

  if (Array.isArray(media)) {
    for (const m of media) {
      if (m?.sourceUrl) return m.sourceUrl;
      if (m?.mediaItemUrl) return m.mediaItemUrl || undefined;
      if ((m as { url?: string | null })?.url) return (m as { url?: string | null }).url || undefined;
    }
    return undefined;
  }

  const obj = media as {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    url?: string | null;
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; url?: string | null };
    nodes?: Array<{ sourceUrl?: string | null; mediaItemUrl?: string | null; url?: string | null }>;
    edges?: Array<{ node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; url?: string | null } }>;
  } | null | undefined;
  if (!obj) return undefined;

  if (obj.node?.sourceUrl) return obj.node.sourceUrl;
  if (obj.node?.mediaItemUrl) return obj.node.mediaItemUrl || undefined;
  if (obj.node?.url) return obj.node.url || undefined;
  if (typeof obj.sourceUrl === "string" && obj.sourceUrl) return obj.sourceUrl;
  if (typeof obj.mediaItemUrl === "string" && obj.mediaItemUrl) return obj.mediaItemUrl;
  if (typeof obj.url === "string" && obj.url) return obj.url;

  if (Array.isArray(obj.nodes) && obj.nodes.length) {
    const n = obj.nodes[0];
    if (n?.sourceUrl) return n.sourceUrl;
    if (n?.mediaItemUrl) return n.mediaItemUrl;
    if (n?.url) return n.url;
  }

  if (Array.isArray(obj.edges) && obj.edges.length) {
    const n = obj.edges[0]?.node;
    if (n?.sourceUrl) return n.sourceUrl;
    if (n?.mediaItemUrl) return n.mediaItemUrl;
    if (n?.url) return n.url;
  }

  return undefined;
}

/** Normaliza o type dos slides do ACF para o que o player entende hoje. */
function normalizeSlideType(t?: string | string[] | null): "text" | "quote" {
  const v = Array.isArray(t) ? (t[0] || "") : (t || "");
  const k = v.toLowerCase();
  if (k === "quote") return "quote";
  // "image" e "video" tambem caem em "text" (usando imageUrl)
  return "text";
}

// --- Queries ---
const queryWithAcfNodes = /* GraphQL */ `
  query Posts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
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
              nodes {
                sourceUrl
                mediaItemUrl
                altText
                mediaDetails {
                  sizes {
                    sourceUrl
                    width
                    height
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const queryWithAcfList = /* GraphQL */ `
  query PostsList($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
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
            media { sourceUrl mediaItemUrl }
          }
        }
      }
    }
  }
`;

const queryBase = /* GraphQL */ `
  query PostsBase($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
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

// --- Handler ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const first = Math.min(parseInt(searchParams.get("first") || "9", 10) || 9, 24);
  const after = searchParams.get("after");

  try {
    let data: WPPostsData;
    try {
      data = await gqlFetch<WPPostsData>(queryWithAcfNodes, { first, after }, 0);
    } catch {
      try {
        data = await gqlFetch<WPPostsData>(queryWithAcfList, { first, after }, 0);
      } catch {
        data = await gqlFetch<WPPostsData>(queryBase, { first, after }, 0);
      }
    }

    const items = data.posts.nodes.map((p) => {
      const text = stripHtml(p.content ?? p.excerpt ?? "");
      const readingMinutes = estimateReadingTime(text);
      const primaryCat = p.categories?.nodes?.[0];
      const cleanExcerpt = stripHtml(p.excerpt || "");
      const dot = cleanExcerpt.indexOf(".");
      const excerpt = dot === -1 ? cleanExcerpt : cleanExcerpt.slice(0, dot + 1).trim();

      // --- SLIDE DE CAPA ---
      const coverUrl = p.featuredImage?.node?.sourceUrl || undefined;
      const coverScreen = {
        type: "text" as const,
        content: stripHtml(p.title),
        imageUrl: coverUrl || null,
      };

      // --- SLIDES DO ACF -> SCREENS ---
      const mappedScreens: Array<{
        type: "text" | "quote" | "image" | "video";
        content?: string | null;
        imageUrl?: string | null;
        videoUrl?: string | null;
        quote?: string | null;
        author?: string | null;
        slideTitle?: string | null;
        showButton?: boolean | null;
      }> = Array.isArray(p.storiesSimples?.stories)
        ? p.storiesSimples!.stories!
            .map((s) => {
              const mediaUrl = pickMediaUrl(s?.media);
              const t = normalizeSlideType(s?.type);
              const rawType = (s?.type || "text").toString().toLowerCase();
              const slideTitle = typeof s?.title === "string" && s.title.trim().length > 0 ? s.title.trim() : null;
              const rawText = typeof s?.text === "string" ? s.text.trim() : "";
              const content = rawText || slideTitle || "";
              const showButton = !!s?.showButton;
              if (t === "quote") {
                return {
                  type: "quote" as const,
                  quote: rawText || slideTitle || "",
                  author: undefined,
                  imageUrl: mediaUrl || null,
                  slideTitle,
                  content,
                  showButton,
                };
              }
              if (rawType === "video") {
                return {
                  type: "video" as const,
                  slideTitle,
                  content,
                  videoUrl: mediaUrl || null,
                  imageUrl: null,
                  showButton,
                };
              }
              if (rawType === "image") {
                return {
                  type: "image" as const,
                  slideTitle,
                  content,
                  imageUrl: mediaUrl || null,
                  showButton,
                };
              }
              return {
                type: "text" as const,
                slideTitle,
                content,
                imageUrl: mediaUrl || null,
                showButton,
              };
            })
            .filter((screen) => {
              if (!screen) return false;
              return Boolean(
                screen.content ||
                  screen.imageUrl ||
                  (screen as { videoUrl?: string | null }).videoUrl ||
                  (screen as { quote?: string | null }).quote
              );
            })
        : [];

      const acfScreens = mappedScreens.length ? mappedScreens : null;
      const screens: Array<{
        type: "text" | "quote" | "image" | "video";
        content?: string | null;
        imageUrl?: string | null;
        videoUrl?: string | null;
        quote?: string | null;
        author?: string | null;
        slideTitle?: string | null;
        showButton?: boolean | null;
      }> = acfScreens || [coverScreen];

      // (no V2 export here; keep legacy screens only)

      return {
        id: p.id,
        title: p.title,
        date: p.date,
        uri: p.uri,
        category: primaryCat ? { name: primaryCat.name, slug: primaryCat.slug } : null,
        image: p.featuredImage?.node?.sourceUrl || null,
        readingTimeMin: readingMinutes,
        excerpt,
        contentHtml: p.content || null,

        // Para compat com codigo antigo que lia acfScreens:
        acfScreens: acfScreens,

        // Novo campo ja pronto pro Player:
        screens,
      };
    });

    return new Response(
      JSON.stringify({
        items,
        pageInfo: data.posts.pageInfo,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load posts";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

