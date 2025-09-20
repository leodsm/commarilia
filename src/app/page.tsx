import { PostsGrid } from "@/components/PostsGrid";
import type { PostCardData } from "@/components/PostCard";
import { fetchCmsPosts, mapPostNodeToCard } from "@/lib/cms";

export const revalidate = 0;

async function getInitial(): Promise<{ items: PostCardData[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } }>
{
  const data = await fetchCmsPosts({ first: 9 });
  const items: PostCardData[] = data.posts.nodes.map(mapPostNodeToCard);
  return { items, pageInfo: data.posts.pageInfo };
}

export default async function Home() {
  let initial: { items: PostCardData[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } } = {
    items: [],
    pageInfo: { endCursor: null, hasNextPage: false },
  };

  try {
    initial = await getInitial();
  } catch {
    // Fail silently to keep page rendering with empty state
  }

  return <PostsGrid initialItems={initial.items} initialPageInfo={initial.pageInfo} />;
}
