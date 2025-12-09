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

/**
 * Remove trechos problematicos do HTML vindo do WordPress
 * (carrosseis, containers Angular, scripts, etc.) que podem
 * injetar elementos de tela cheia ou fundos estranhos (como a tela azul).
 */
function sanitizeStoryHtml(html: string): string {
  if (!html) return '';

  try {
    // DOMParser existe apenas no browser; em SSR simplesmente retorna o HTML cru
    if (typeof DOMParser === 'undefined') {
      return html;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove scripts, styles e iframes por seguranca
    doc.querySelectorAll('script, style, iframe').forEach((el) => el.remove());

    // Remove blocos de carrossel/container que vem nos textos
    const selectors = [
      '.container.ng-tns-*',
      '[class*="carousel-container"]',
      '[class*="sources-carousel"]',
      '[class*="ng-tns-"]',
    ];

    selectors.forEach((selector) => {
      // Seletor com wildcard (ex: 'ng-tns-*')
      if (selector.includes('*')) {
        const token = selector.replace(/[\.\[\]\*]/g, '').replace('class=', '');
        doc.querySelectorAll(`[class*="${token}"]`).forEach(el => {
          el.remove();
        });
      } else {
        // Seletor normal
        doc.querySelectorAll(selector).forEach((el) => el.remove());
      }
    });

    return doc.body.innerHTML;
  } catch (e) {
    console.warn('sanitizeStoryHtml failed', e);
    return html;
  }
}

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
  const sanitized = sanitizeStoryHtml(html);
  return sanitized;
}

function transformData(nodes: StoryNode[]): TransformedStory[] {
  return nodes
    .map((post, postIndex): TransformedStory | null => {
      const rawSlides = post.conteudoDosStories?.conteudo?.slides || [];
      // Filter out posts with no slides immediately
      if (rawSlides.length === 0) return null;

      const segments: TransformedSegment[] = rawSlides.map((slide, segIndex) => ({
        id: slugify(slide.title) || `segment-${segIndex}`,
        title: (slide.title || '').trim(),
        descriptionHTML: generateDescriptionHTML(slide.text || ''),
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