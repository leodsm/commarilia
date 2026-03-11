export interface MediaNode {
  mediaItemUrl: string;
  mimeType: string;
}

export interface Slide {
  mediaSource?: 'file' | 'youtube';
  youtubeUrl?: string;
  media?: {
    node: MediaNode;
  };
  title?: string;
  text?: string;
  contentPosition?: 'top' | 'center' | 'bottom';
  textSize?: 'small' | 'medium' | 'large';
  showOverlay?: boolean;
  showButton?: boolean;
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
    nodes: Array<{ name: string }>;
  };
  conteudoDosStories?: {
    conteudo?: {
      slides?: Slide[];
    };
  };
}

export interface TransformedSegment {
  id: string;
  mediaUrl: string;
  mediaType: string;
  title: string;
  description: string;
  contentPosition: 'top' | 'center' | 'bottom';
  textSize: 'small' | 'medium' | 'large';
  showOverlay: boolean;
  showButton: boolean;
}

export interface TransformedStory {
  id: string;
  originalId: string;
  title: string;
  content: string; // HTML content for modal
  coverImage: string;
  category: string;
  showOverlay?: boolean;
  segments: TransformedSegment[];
}

export interface GraphQLResponse {
  data: {
    posts: {
      nodes: StoryNode[];
    };
  };
  errors?: { message: string }[];
}