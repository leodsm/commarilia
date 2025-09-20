import { NextRequest } from "next/server";
import { fetchCmsPosts, mapPostNodeToCard } from "@/lib/cms";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const first = Math.min(parseInt(searchParams.get("first") || "9", 10) || 9, 24);
  const after = searchParams.get("after");

  try {
    const data = await fetchCmsPosts({ first, after });
    const items = data.posts.nodes.map(mapPostNodeToCard);

    return new Response(
      JSON.stringify({ items, pageInfo: data.posts.pageInfo }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load posts";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}





