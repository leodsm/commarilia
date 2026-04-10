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
  showButton?: boolean;
  slidelink?: string;
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
      subtitulo?: string;
      slides?: Slide[];
    };
  };
}

export interface TransformedSegment {
  id: string;
  mediaUrl: string;
  mediaType: string;
  showButton: boolean;
  slideLink?: string;
}

export interface TransformedStory {
  id: string;
  originalId: string;
  title: string;
  content: string; // HTML content for modal
  coverImage: string;
  category: string;
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