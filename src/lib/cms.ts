import { gqlFetch } from "./graphql";
import type { PostCardData } from "@/components/PostCard";
import type { StoryScreen } from "@/components/StoryPlayer";

type CmsMediaNode = {
  sourceUrl?: string | null;
  mediaItemUrl?: string | null;
  url?: string | null;
  mimeType?: string | null;
  mime_type?: string | null;
};

type CmsStory = {
  title?: string | null;
  text?: string | null;
  showButton?: boolean | number | null;
  media?: { nodes?: CmsMediaNode[] } | CmsMediaNode | null;
  verticalPosition?: string | null;
};

type CmsPostNode = {
  id: string;
  title: string;
  date: string;
  uri: string;
  excerpt?: string | null;
  content?: string | null;
  categories?: { nodes?: Array<{ name: string; slug: string }> | null } | null;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
  storiesSimples?: { stories?: Array<CmsStory | null> | null } | null;
};

type CmsPostsQuery = {
  posts: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    nodes: CmsPostNode[];
  };
};

const POSTS_QUERY = /* GraphQL */ `
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
            title
            text
            showButton
            verticalPosition
            media {
              nodes {
                sourceUrl
                mediaItemUrl
                mimeType
              }
            }
          }
        }
      }
    }
  }
`;

const POSTS_QUERY_FALLBACK = /* GraphQL */ `
  query PostsFallback($first: Int!, $after: String) {
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
            title
            text
            showButton
            media {
              nodes {
                sourceUrl
                mediaItemUrl
                mimeType
              }
            }
          }
        }
      }
    }
  }
`;

const HTML_TAG_REGEX = /<[^>]*>/g;

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  const noTags = html.replace(HTML_TAG_REGEX, " ");
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

type NormalizedStoryContent = { text: string; textAlign: "left" | "center" | "right" };

function detectTextAlign(html: string): NormalizedStoryContent["textAlign"] {
  const value = html.toLowerCase();
  if (value.includes("text-align:right") || value.includes("has-text-align-right")) return "right";
  if (value.includes("text-align:center") || value.includes("has-text-align-center")) return "center";
  return "left";
}

function extractStoryContent(html?: string | null): NormalizedStoryContent {
  if (!html) return { text: "", textAlign: "left" };

  const textAlign = detectTextAlign(html);

  let normalized = html
    .replace(/<\s*li[^>]*>/gi, "\n• ")
    .replace(/<\s*\/li\s*>/gi, "\n")
    .replace(/<\/?\s*ul[^>]*>/gi, "\n")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/p\s*>/gi, "\n\n")
    .replace(/<\s*p[^>]*>/gi, "");

  normalized = normalized.replace(HTML_TAG_REGEX, "");

  const lines = normalized
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line, index, arr) => {
      if (!line) {
        return index > 0 && arr[index - 1] !== "";
      }
      return true;
    });

  return { text: lines.join("\n").trim(), textAlign };
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function firstMediaNode(media: CmsStory["media"]): CmsMediaNode | undefined {
  if (!media) return undefined;
  if (typeof (media as { nodes?: CmsMediaNode[] }).nodes !== "undefined") {
    const list = (media as { nodes?: CmsMediaNode[] }).nodes;
    return Array.isArray(list) && list.length ? list[0] : undefined;
  }
  return media as CmsMediaNode;
}

export function pickMediaUrl(media: CmsStory["media"]): string | undefined {
  const node = firstMediaNode(media);
  if (!node) return undefined;
  if (node.sourceUrl) return node.sourceUrl || undefined;
  if (node.mediaItemUrl) return node.mediaItemUrl || undefined;
  if (node.url) return node.url || undefined;
  return undefined;
}

export function pickMediaMimeType(media: CmsStory["media"]): string | undefined {
  const node = firstMediaNode(media);
  if (!node) return undefined;
  if (node.mimeType) return node.mimeType || undefined;
  if (node.mime_type) return node.mime_type || undefined;
  return undefined;
}

export function isVideoMedia(url: string | null | undefined, mime?: string | undefined): boolean {
  if (mime && mime.toLowerCase().startsWith("video")) return true;
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function mapVerticalPosition(value?: string | null): StoryScreen["contentVertical"] {
  const normalized = (value || "").trim().toLowerCase();
  if (["top", "superior", "alto", "acima"].includes(normalized)) return "top";
  if (["center", "centro", "meio", "middle"].includes(normalized)) return "center";
  if (["bottom", "inferior", "baixo"].includes(normalized)) return "bottom";
  return "bottom";
}

export async function fetchCmsPosts({
  first,
  after,
}: {
  first: number;
  after?: string | null;
}) {
  try {
    return await gqlFetch<CmsPostsQuery>(POSTS_QUERY, { first, after: after ?? null }, 0);
  } catch (err) {
    return gqlFetch<CmsPostsQuery>(POSTS_QUERY_FALLBACK, { first, after: after ?? null }, 0);
  }
}

export function mapPostNodeToCard(p: CmsPostNode): PostCardData {
  const html = p.content || p.excerpt || "";
  const text = stripHtml(html);
  const readingTimeMin = estimateReadingTime(text);

  const primaryCat = p.categories?.nodes?.[0] ?? null;

  const rawExcerpt = stripHtml(p.excerpt || "");
  const periodIndex = rawExcerpt.indexOf(".");
  const excerpt = periodIndex === -1 ? rawExcerpt : `${rawExcerpt.slice(0, periodIndex + 1).trim()}`;

  const slidesRaw = Array.isArray(p.storiesSimples?.stories) ? (p.storiesSimples?.stories ?? []) : [];

  const slides = slidesRaw
    .map((story) => {
      if (!story) return null;
      const mediaUrl = pickMediaUrl(story.media);
      const mediaMime = pickMediaMimeType(story.media);
      const titleInfo = extractStoryContent(story.title);
      const textInfo = extractStoryContent(story.text);
      const slideTitle = titleInfo.text || null;
      const textContent = textInfo.text;
      const showButton = story.showButton === true || story.showButton === 1;
      const hasQuoteMarkup = typeof story.text === "string" && /<blockquote/i.test(story.text);
      const baseContent = textContent || slideTitle || "";
      const textAlign = textInfo.textAlign !== "left" ? textInfo.textAlign : titleInfo.textAlign;
      const contentVertical = mapVerticalPosition(story.verticalPosition);

      if (!mediaUrl && !baseContent) return null;

      if (hasQuoteMarkup && baseContent) {
        return {
          type: "quote" as StoryScreen["type"],
          slideTitle,
          quote: baseContent,
          content: baseContent,
          imageUrl: mediaUrl || null,
          showButton,
          textAlign,
          contentVertical,
        } satisfies StoryScreen;
      }

      if (isVideoMedia(mediaUrl ?? null, mediaMime)) {
        return {
          type: "video" as StoryScreen["type"],
          slideTitle,
          content: baseContent,
          videoUrl: mediaUrl || null,
          imageUrl: null,
          showButton,
          textAlign,
          contentVertical,
        } satisfies StoryScreen;
      }

      if (mediaUrl) {
        return {
          type: "image" as StoryScreen["type"],
          slideTitle,
          content: baseContent,
          imageUrl: mediaUrl,
          showButton,
          textAlign,
          contentVertical,
        } satisfies StoryScreen;
      }

      return {
        type: "text" as StoryScreen["type"],
        slideTitle,
        content: baseContent,
        showButton,
        textAlign,
        contentVertical,
      } satisfies StoryScreen;
    })
    .filter(Boolean) as StoryScreen[];

  const coverScreen: StoryScreen = {
    type: "text",
    slideTitle: stripHtml(p.title),
    content: rawExcerpt || stripHtml(p.title),
    imageUrl: p.featuredImage?.node?.sourceUrl || null,
    showButton: true,
    textAlign: "left",
    contentVertical: "bottom",
  };

  const acfScreens = slides.length ? slides : [coverScreen];

  return {
    id: p.id,
    title: p.title,
    date: p.date,
    uri: p.uri,
    image: p.featuredImage?.node?.sourceUrl || null,
    readingTimeMin,
    category: primaryCat ? { name: primaryCat.name, slug: primaryCat.slug } : null,
    excerpt,
    contentHtml: p.content || null,
    acfScreens,
  } satisfies PostCardData;
}
