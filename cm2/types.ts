export interface Segment {
  id: string;
  title?: string;
  descriptionHTML?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  contentPosition: 'top' | 'center' | 'bottom';
  textSize: 'small' | 'medium' | 'large';
  showOverlay: boolean;
  showButton: boolean;
}

export interface Story {
  id: string;
  slug?: string;
  title: string;
  excerpt?: string;
  category: string;
  image: string; // Thumbnail
  date?: string;
  fullContent: string; // HTML for the modal
  segments: Segment[];
}

export type TransformedStory = Story;
export type TransformedSegment = Segment;

export interface CacheData {
  stories: TransformedStory[];
  timestamp: number;
}

export interface StoryNode {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
  categories?: {
    nodes: {
      name: string;
    }[];
  };
  conteudoDosStories?: {
    conteudo?: {
      slides?: {
        media?: {
          node?: {
            mediaItemUrl: string;
            mimeType: string;
          };
        };
        title?: string;
        text?: string;
        contentPosition?: 'top' | 'center' | 'bottom';
        textSize?: 'small' | 'medium' | 'large';
        showOverlay?: boolean;
        showButton?: boolean;
      }[];
    };
  };
}