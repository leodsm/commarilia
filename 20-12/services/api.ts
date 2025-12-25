import { GraphQLResponse, TransformedStory, StoryNode } from '../types';

const GRAPHQL_ENDPOINT = 'https://portal.commarilia.com/graphql';

const GQL_QUERY = `
  query GetStories {
      posts(first: 50) {
          nodes {
              id
              slug
              title
              content
              featuredImage {
                  node {
                      sourceUrl(size: LARGE)
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
                          mediaSource
                          youtubeUrl
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

// Helper to clean HTML text for descriptions
function generateDescription(html: string): string {
  if (!html) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const listItems = doc.querySelectorAll('li');

  if (listItems.length > 0) {
    return Array.from(listItems).map(li => `• ${li.textContent?.trim()}`).join('<br>');
  }
  return doc.body.textContent || '';
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export const fetchStories = async (): Promise<TransformedStory[]> => {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: GQL_QUERY }),
      // Add cache control for Vercel/Browsers
      cache: 'force-cache',
      next: { revalidate: 300 } // Strategy if using Next.js, ignored in pure React but good practice
    } as RequestInit);

    const json: GraphQLResponse = await response.json();

    if (json.errors) {
      throw new Error(json.errors[0].message);
    }

    const nodes = json.data.posts.nodes;

    return nodes
      .map((post: StoryNode, index: number) => {
        const slides = post.conteudoDosStories?.conteudo?.slides || [];
        const storyId = post.slug || slugify(post.title) || `story-${index}`;

        // Filter out stories without content
        if (slides.length === 0) return null;

        return {
          id: storyId,
          originalId: post.id,
          title: post.title,
          content: post.content || '<p>Conteúdo indisponível</p>',
          coverImage: post.featuredImage?.node?.sourceUrl || 'https://picsum.photos/400/500',
          category: post.categories?.nodes[0]?.name || 'Geral',
          segments: slides.map((slide, sIdx) => {
            let mediaUrl = slide.media?.node?.mediaItemUrl || '';
            let mediaType = slide.media?.node?.mimeType || 'image/jpeg';

            // Safely get mediaSource value (it might be an array or string)
            const source = Array.isArray(slide.mediaSource) ? slide.mediaSource[0] : slide.mediaSource;

            if (source === 'youtube' && slide.youtubeUrl) {
              mediaUrl = slide.youtubeUrl;
              mediaType = 'video/youtube';
            } else if (source === 'vimeo' && slide.youtubeUrl) {
              mediaUrl = slide.youtubeUrl;
              mediaType = 'video/vimeo';
            }

            return {
              id: `${storyId}-seg-${sIdx}`,
              mediaUrl: mediaUrl,
              mediaType: mediaType,
              title: (slide.title || '').trim(),
              description: generateDescription(slide.text || ''),
              contentPosition: slide.contentPosition || 'bottom',
              textSize: slide.textSize || 'medium',
              showOverlay: slide.showOverlay !== false,
              showButton: slide.showButton !== false,
            };
          }),
        };
      })
      .filter((story): story is TransformedStory => story !== null);
  } catch (error) {
    console.error('API Fetch Error:', error);
    return [];
  }
};