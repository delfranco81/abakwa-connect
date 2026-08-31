import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type SearchRequest = {
  query?: string;
  localResultCount?: number;
};

type WebResult = {
  title: string;
  url: string;
  snippet: string;
  source: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

const WEB_MAX_RESULTS = 20;

function json(
  data: unknown,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type":
          "application/json",
      },
    }
  );
}

function cleanQuery(
  value: unknown
): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function extractDomain(
  url: string
): string {
  try {
    return new URL(url).hostname
      .replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function searchWeb(
  query: string
): Promise<WebResult[]> {
  const apiKey =
    Deno.env.get(
      "ECOS_WEB_SEARCH_API_KEY"
    );

  if (!apiKey) {
    console.error(
      "ECOS_WEB_SEARCH_API_KEY is not configured."
    );

    return [];
  }

  const response = await fetch(
    "https://api.tavily.com/search",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        api_key: apiKey,
        query,

        search_depth:
          "advanced",

        /*
         * ECOS requests more web information
         * so the result page is not restricted
         * to the previous 8-result limit.
         */
        max_results:
          WEB_MAX_RESULTS,

        include_answer:
          false,

        include_raw_content:
          false,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "ECOS web provider error:",
      response.status,
      errorText
    );

    return [];
  }

  const payload =
    await response.json();

  const results =
    Array.isArray(
      payload?.results
    )
      ? payload.results
      : [];

  return results
    .map(
      (item: any): WebResult => ({
        title:
          String(
            item?.title || ""
          ),

        url:
          String(
            item?.url || ""
          ),

        snippet:
          String(
            item?.content ||
              item?.snippet ||
              ""
          ),

        source:
          extractDomain(
            String(
              item?.url || ""
            )
          ),
      })
    )
    .filter(
      (item) =>
        item.title &&
        item.url
    );
}

export default {
  fetch: withSupabase(
    {
      auth: [
        "publishable",
        "secret",
      ],
    },

    async (req) => {
      if (
        req.method ===
        "OPTIONS"
      ) {
        return new Response(
          "ok",
          {
            status: 200,
            headers:
              corsHeaders,
          }
        );
      }

      if (
        req.method !== "POST"
      ) {
        return json(
          {
            error:
              "Method not allowed",
          },
          405
        );
      }

      try {
        const body =
          (await req.json()) as SearchRequest;

        const query =
          cleanQuery(
            body?.query
          );

        if (!query) {
          return json(
            {
              error:
                "A search query is required.",
            },
            400
          );
        }

        /*
         * ECOS keeps local Everyday Connect
         * results and external web results
         * as separate search layers.
         *
         * The web search does not stop because
         * local results exist.
         */

        const localResultCount =
          Number(
            body?.localResultCount
          ) || 0;

        const results =
          await searchWeb(
            query
          );

        return json({
          query,

          searchedWeb: true,

          localResultCount,

          results,

          searchedAt:
            new Date().toISOString(),
        });

      } catch (error) {
        console.error(
          "ECOS web-search error:",
          error
        );

        return json(
          {
            error:
              "ECOS could not complete the web search.",
          },
          500
        );
      }
    }
  ),
};
