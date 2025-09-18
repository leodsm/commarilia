const DEFAULT_ENDPOINT = "https://portal.commarilia.com/graphql";

const CMS_GRAPHQL_ENDPOINT =
  process.env.CMS_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_CMS_GRAPHQL_ENDPOINT || DEFAULT_ENDPOINT;

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate: number = 60
) {
  const init: RequestInit & { next?: { revalidate?: number } } = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  };
  if (revalidate <= 0) {
    (init as RequestInit).cache = "no-store";
  } else {
    init.next = { revalidate };
  }

  const res = await fetch(CMS_GRAPHQL_ENDPOINT, init);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText} ${text}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors && json.errors.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  return json.data as T;
}
