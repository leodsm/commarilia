import { StoryNode, TransformedStory, TransformedSegment, CacheData } from '../types';
import { safeGetItem, safeSetItem } from './storage';

const GRAPHQL_ENDPOINT = 'https://portal.commarilia.com/graphql';
const CACHE_KEY = 'commarilia_cache_v1';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// In-memory cache to prevent refetching during session
let memoryCache: TransformedStory[] | null = null;

const GQL_QUERY = `
  query GetStories {
      posts(first: 20) {
          nodes {
              id
              slug
              title
              content
              featuredImage {
                  node {
                      sourceUrl(size: MEDIUM_LARGE)
                  }
              }
              categories {
                  nodes {
                      name
                  }
              }
              conteudoDosStories {
                  conteudo {
                      slides {
                          media {
                              node {
                                  mediaItemUrl
                                  mimeType
                              }
                          }
                          title
                          text
                          contentPosition
                          textSize
                          showOverlay
                          showButton
                      }
                  }
              }
          }
      }
  }`;

function slugify(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function generateDescriptionHTML(html: string): string {
  if (!html) return '';
  // Basic HTML cleanup/formatting if needed. 
  // In a real React app, we might use DOMParser, but raw string manip is faster for simple cleaning.
  return html.replace(/<p>/g, '').replace(/<\/p>/g, '<br/>'); 
}

function transformData(nodes: StoryNode[]): TransformedStory[] {
  return nodes
    .map((post, postIndex) => {
      const rawSlides = post.conteudoDosStories?.conteudo?.slides || [];
      // Filter out posts with no slides immediately
      if (rawSlides.length === 0) return null;

      const segments: TransformedSegment[] = rawSlides.map((slide, segIndex) => ({
        id: slugify(slide.title) || `segment-${segIndex}`,
        title: (slide.title || '').trim(),
        descriptionHTML: slide.text || '', // Keep raw HTML for parsing later
        mediaUrl: slide.media?.node?.mediaItemUrl || '',
        mediaType: slide.media?.node?.mimeType?.startsWith('video/') ? 'video' : 'image',
        contentPosition: slide.contentPosition || 'bottom',
        textSize: slide.textSize || 'medium',
        showOverlay: slide.showOverlay !== false,
        showButton: slide.showButton !== false,
      }));

      return {
        id: post.slug || slugify(post.title) || `story-${postIndex}`,
        slug: post.slug,
        title: post.title,
        category: post.categories?.nodes[0]?.name || 'Geral',
        image: post.featuredImage?.node?.sourceUrl || 'https://picsum.photos/400/600',
        fullContent: post.content || '',
        segments: segments
      };
    })
    .filter((story): story is TransformedStory => story !== null);
}

export async function fetchStories(forceRefresh: boolean = false): Promise<TransformedStory[]> {
  // 1. Check Memory Cache (skip if forcing refresh)
  if (!forceRefresh && memoryCache) return memoryCache;

  // 2. Check LocalStorage (skip if forcing refresh)
  if (!forceRefresh) {
    try {
        const cached = safeGetItem(CACHE_KEY);
        if (cached) {
        const parsed: CacheData = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            memoryCache = parsed.stories;
            return parsed.stories;
        }
        }
    } catch (e) {
        console.warn('Cache parsing failed', e);
    }
  }

  // 3. Network Fetch
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GQL_QUERY })
    });

    const json = await response.json();
    if (json.errors) throw new Error('GraphQL Error');

    const transformed = transformData(json.data.posts.nodes);
    
    // Update Caches
    memoryCache = transformed;
    safeSetItem(
      CACHE_KEY,
      JSON.stringify({
        stories: transformed,
        timestamp: Date.now(),
      }),
    );

    return transformed;
  } catch (error) {
    console.error('Fetch failed', error);
    // If fetch fails but we have stale cache, return that? 
    // For now, return empty array to handle UI error state.
    return [];
  }
}
