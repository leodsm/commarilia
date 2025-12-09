import { StoryNode, TransformedStory, TransformedSegment, CacheData } from '../types';
import { safeGetItem, safeSetItem } from './storage';

const GRAPHQL_ENDPOINT = 'https://portal.commarilia.com/graphql';
const CACHE_KEY = 'commarilia_cache_v1';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// In-memory cache to prevent refetching during session
let memoryCache: TransformedStory[] | null = null;

const GQL_QUERY_WITH_BUTTON_POSITION = `
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
                          buttonPosition
                      }
                  }
              }
          }
      }
  }`;

// Fallback sem buttonPosition para ambientes que ainda não expõem o campo
const GQL_QUERY_SAFE = `
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
      '[class*="button-container"]', // spans que inserem caracteres "ÿ"
      '.hide-from-message-actions',
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

    // Remove caracteres estranhos que sobram dos spans removidos
    const cleanedHtml = doc.body.innerHTML.replace(/[\u00ff\uFFFD]/g, '').trim();
    return cleanedHtml;
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

type RawSlide = StoryNode['conteudoDosStories'] extends { conteudo?: { slides?: (infer S)[] } } ? S : never;

function pickFirstString(value: unknown, fallback: string): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : fallback;
  }
  return typeof value === 'string' ? value : fallback;
}

function pickOptionalString(value: unknown): string | undefined {
  const chosen = pickFirstString(value, '');
  return chosen || undefined;
}

function buildFullContent(html: string | null | undefined, slides: RawSlide[] = []): string {
  const sanitized = sanitizeStoryHtml(html || '');
  if (sanitized.trim()) return sanitized;

  const fallbackSections = slides
    .map((slide, index) => {
      const title = (slide.title || '').trim();
      const text = generateDescriptionHTML(slide.text || '');
      if (!title && !text.trim()) return null;

      const heading = title ? `<h3>${title}</h3>` : '';
      return `<section data-fallback-segment="${index}">${heading}${text}</section>`;
    })
    .filter((section): section is string => Boolean(section));

  return fallbackSections.join('');
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
        contentPosition: pickFirstString((slide as any).contentPosition, 'bottom'),
        textSize: pickFirstString((slide as any).textSize, 'medium'),
        showOverlay: slide.showOverlay !== false,
        showButton: slide.showButton !== false,
        buttonPosition: pickOptionalString((slide as any).buttonPosition),
      }));

      return {
        id: post.slug || slugify(post.title) || `story-${postIndex}`,
        slug: post.slug,
        title: post.title,
        category: post.categories?.nodes[0]?.name || 'Geral',
        image: post.featuredImage?.node?.sourceUrl || 'https://picsum.photos/400/600',
        fullContent: buildFullContent(post.content, rawSlides),
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
  const executeQuery = async (query: string) => {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const json = await response.json();
    if (json.errors) {
      const message = json.errors.map((e: any) => e.message || '').join(' | ');
      throw new Error(message || 'GraphQL Error');
    }
    return json;
  };

  try {
    let json;
    try {
      // Tenta com buttonPosition primeiro
      json = await executeQuery(GQL_QUERY_WITH_BUTTON_POSITION);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('buttonPosition')) {
        console.warn('buttonPosition não exposto no GraphQL, usando fallback sem o campo');
        json = await executeQuery(GQL_QUERY_SAFE);
      } else {
        throw err;
      }
    }

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
