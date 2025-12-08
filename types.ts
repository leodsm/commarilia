export interface MediaNode {
  mediaItemUrl: string;
  mimeType: string;
}

export interface Slide {
  media: {
    node: MediaNode;
  };
  title: string;
  text: string;
  contentPosition?: 'top' | 'center' | 'bottom';
  textSize?: 'small' | 'medium' | 'large';
  showOverlay?: boolean;
  showButton?: boolean;
}

export interface StoryNode {
  id: string;
  slug: string;
  title: string;
  content?: string; // HTML content
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
  categories?: {
    nodes: Array<{ name: string }>;
  };
  conteudoDosStories?: {
    conteudo?: {
      slides?: Slide[];
    };
  };
}

export interface TransformedStory {
  id: string; // Unique identifier (slug or generated)
  title: string;
  slug: string;
  category: string;
  image: string;
  fullContent: string; // HTML content for the modal
  segments: TransformedSegment[];
}

export interface TransformedSegment {
  id: string; // Slugified title or index
  title: string;
  descriptionHTML: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  contentPosition: 'top' | 'center' | 'bottom';
  textSize: 'small' | 'medium' | 'large';
  showOverlay: boolean;
  showButton: boolean;
}

export interface CacheData {
  stories: TransformedStory[];
  timestamp: number;
}