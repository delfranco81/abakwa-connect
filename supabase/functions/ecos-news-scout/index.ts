import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type WebResult = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string | null;
  scoutCategory?: string;
};
type NewsDraft = {
  title: string;
  summary: string;
  content: string;
  category: string;
  source_name: string;
  source_url: string;
  source_published_at: string | null;
  source_id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function cleanText(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}


function isGenericSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname
      .replace(/\/+/g, "/")
      .replace(/\/$/, "")
      .toLowerCase();

    if (!path || path === "/") {
      return true;
    }

    const genericExactPaths = new Set([
      "/hub",
      "/countries",
      "/country",
      "/where-we-work",
      "/regions",
      "/topics",
      "/category",
      "/africa",
      "/world",
      "/world-news",
      "/sport",
      "/sports",
      "/news",
      "/business",
      "/politics",
      "/health",
      "/technology",
      "/cameroon",
      "/latest",
      "/latest-news",
    ]);

    if (genericExactPaths.has(path)) {
      return true;
    }

    const genericPatterns = [
      /\/hub$/,
      /\/countries$/,
      /\/country$/,
      /\/where-we-work$/,
      /\/regions$/,
      /\/topics$/,
      /\/category$/,
      /^\/h\//,
    ];

    return genericPatterns.some((pattern) =>
      pattern.test(path)
    );
  } catch {
    return true;
  }
}

async function searchWeb(
  query: string,
  maxResults = 6
): Promise<WebResult[]> {
  const apiKey = Deno.env.get("ECOS_WEB_SEARCH_API_KEY");

  if (!apiKey) {
    throw new Error("ECOS_WEB_SEARCH_API_KEY is not configured.");
  }

  const cutoffTime =
    Date.now() - 3 * 24 * 60 * 60 * 1000;

  const startDate = new Date(cutoffTime)
    .toISOString()
    .slice(0, 10);

  const response = await fetch(
    "https://api.tavily.com/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        topic: "news",
        start_date: startDate,
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: false,
        include_raw_content: false,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Web search failed with status ${response.status}: ${errorText}`
    );
  }

  const payload = await response.json();

  const results = Array.isArray(payload?.results)
    ? payload.results
    : [];

  return results
    .map(
      (item: any): WebResult => ({
        title: cleanText(item?.title),
        url: cleanText(item?.url),
        snippet: cleanText(item?.content || item?.snippet),
        source: extractDomain(cleanText(item?.url)),
        publishedAt:
          cleanText(item?.published_date) || null,
      })
    )
    .filter((item: WebResult) => {
      if (
        !item.title ||
        !item.url ||
        !item.snippet ||
        !item.source ||
        !item.publishedAt ||
        isGenericSourceUrl(item.url)
      ) {
        return false;
      }

      const publishedTime = Date.parse(
        item.publishedAt
      );

      if (!Number.isFinite(publishedTime)) {
        return false;
      }

      return (
        publishedTime >= cutoffTime &&
        publishedTime <= Date.now() + 5 * 60 * 1000
      );
    });
}
async function summarizeWithOpenAI(
  results: WebResult[],
  category: string
): Promise<NewsDraft[]> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const sourceMaterial = results
    .map(
      (item, index) =>
        `SOURCE ${index + 1}
Scout category: ${item.scoutCategory || "Other"}
Title: ${item.title}
Source: ${item.source}
URL: ${item.url}
Content: ${item.snippet}`
    )
    .join("\n\n");

  const systemPrompt = `
You are the Everyday Connect News Editor.

Turn the supplied verified web search results into accurate, useful and clearly categorized news stories for Everyday Connect.

STRICT FACTUAL RULES:
- Use ONLY information supplied in the source material.
- Never invent facts, people, dates, quotes, statistics, locations or events.
- Do not present speculation as fact.
- Never create a source that was not supplied.
- Keep each source URL exactly as supplied.
- Every published story must be supported by at least one supplied source.
- Do not combine unrelated events into one story.
- Avoid duplicate or substantially overlapping stories.

STORY SELECTION:
- Produce MULTIPLE distinct news stories from the strongest useful sources.
- For an automatic all-category scout, normally return 8-15 distinct stories when enough strong sources are available.
- Do not return only one story when several strong and distinct sources are available.
- Each story must represent a genuinely different news event or development.
- Prefer recent, important and well-supported stories.
- Do not create a story simply to reach the target number.
- If fewer than 8 strong stories are supported by the supplied sources, return only the genuinely supported stories.

CATEGORY RULES:
- Use the supplied Scout category as a strong classification signal.
- Choose the category that best describes the actual news event.
- Never use "Other" merely because the automatic request covers multiple categories.
- Use "Cameroon" for important Cameroon national developments that are not primarily political, business, sports, technology, health, education, transport or another specialized category.
- Use "Local & Community" for community-level developments, humanitarian/community matters and local public services.
- Use "Politics" for elections, governments, political parties, political leadership, diplomacy and major policy developments.
- Use "Business & Finance" for companies, markets, banking, investment, trade, finance and economic business developments.
- Use "Sports" for sports competitions, teams, athletes and tournaments.
- Use "Technology" for technology, artificial intelligence, digital innovation, cybersecurity and startups.
- Use "Education" for schools, universities, examinations, scholarships, training and research related to education.
- Use "Jobs & Opportunities" for employment, recruitment, internships, grants, fellowships and professional opportunities.
- Use "Transport" for roads, traffic, aviation, railways, public transport, logistics and mobility.
- Use "Health" for healthcare, public health, diseases, prevention, medicine and medical research.
- Use "Africa" for major African regional or continental developments that are not better classified by a specialized category.
- Use "World" for major international developments outside the Africa-focused categories.
- Use "Other" only when none of the allowed categories genuinely fits.

WRITING:
- Write clear, neutral and easy-to-read English.
- Summary should be approximately 2-4 sentences.
- Content should provide useful additional context without copying the source.
- Do not use sensational or misleading headlines.
- Clearly distinguish confirmed information from uncertainty.

SOURCE FIELDS:
- source_name must identify the supplied source.
- source_url must be copied exactly from the supplied source.
- source_id must be derived from the supplied source URL.
- source_published_at may be null when the source publication date is not available.
- Never invent a publication date.

ALLOWED CATEGORIES:
Local & Community
Cameroon
Africa
World
Politics
Business & Finance
Sports
Technology
Education
Jobs & Opportunities
Transport
Health
Other

OUTPUT:
Return ONLY valid JSON.
Return an array of objects containing exactly:
title
summary
content
category
source_name
source_url
source_published_at
source_id

Do not include markdown fences.
Do not include commentary before or after the JSON.
`;
  const maxSourceMaterialLength = 18000;

  const trimmedSourceMaterial =
    sourceMaterial.length > maxSourceMaterialLength
      ? sourceMaterial.slice(0, maxSourceMaterialLength)
      : sourceMaterial;

  const trimmedUserPrompt = `
Requested category: ${category === "Other" ? "All categories" : category}

For this automatic news run, create a balanced selection of the strongest distinct stories across the available Scout categories.

SOURCE MATERIAL:

${trimmedSourceMaterial}
`;

  let response: Response | null = null;
  let lastErrorDetails = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          max_output_tokens: 2500,
          input: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: trimmedUserPrompt,
            },
          ],
        }),
      }
    );

    if (response.ok) {
      break;
    }

    const errorText = await response.text();

    console.error(
      `OpenAI error attempt ${attempt}:`,
      response.status,
      errorText
    );

    let errorDetails = "";

    try {
      const errorPayload = JSON.parse(errorText);

      errorDetails =
        errorPayload?.error?.code ||
        errorPayload?.error?.type ||
        errorPayload?.error?.message ||
        "";
    } catch {
      errorDetails = "";
    }

    lastErrorDetails = errorDetails;

    if (
      response.status !== 429 ||
      errorDetails !== "rate_limit_exceeded" ||
      attempt === 2
    ) {
      break;
    }

    const delayMs = attempt * 8000;

    console.log(
      `OpenAI rate limit detected. Retrying in ${delayMs}ms...`
    );

    await new Promise((resolve) =>
      setTimeout(resolve, delayMs)
    );
  }

  if (!response || !response.ok) {
    throw new Error(
      `OpenAI request failed with status ${response?.status || 500}${lastErrorDetails ? ` (${lastErrorDetails})` : ""}.`
    );
  }

  const payload = await response.json();

  const outputText = Array.isArray(payload?.output)
    ? payload.output
        .flatMap((item: any) =>
          Array.isArray(item?.content)
            ? item.content
            : []
        )
        .map((item: any) =>
          typeof item?.text === "string"
            ? item.text
            : ""
        )
        .join("")
        .trim()
    : "";

  if (!outputText) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(outputText);
  } catch {
    throw new Error("OpenAI returned invalid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("OpenAI response was not a news array.");
  }

  return parsed
    .map(
      (item: any): NewsDraft => ({
        title: cleanText(item?.title),
        summary: cleanText(item?.summary),
        content: cleanText(item?.content),
        category: cleanText(item?.category) || category,
        source_name: cleanText(item?.source_name),
        source_url: cleanText(item?.source_url),
        source_published_at:
          item?.source_published_at
            ? cleanText(item.source_published_at)
            : null,
        source_id: cleanText(item?.source_id),
      })
    )
    .filter(
      (item: NewsDraft) =>
        item.title &&
        item.summary &&
        item.content &&
        item.source_name &&
        item.source_url &&
        item.source_id
    );
}

function normalizeSourceId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");
}

async function publishNews(
  supabase: ReturnType<typeof createClient>,
  drafts: NewsDraft[],
  results: WebResult[],
  scoutedAt: string
) {
  const published: any[] = [];

  const normalizeTitle = (value: string): string =>
    value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  const titleTokens = (value: string): Set<string> => {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "of", "to", "in",
      "on", "for", "with", "from", "by", "after", "before",
      "is", "are", "has", "have", "this", "that"
    ]);

    return new Set(
      normalizeTitle(value)
        .split(" ")
        .filter(
          (word) =>
            word.length >= 4 &&
            !stopWords.has(word)
        )
    );
  };

  const similarity = (
    first: string,
    second: string
  ): number => {
    const a = titleTokens(first);
    const b = titleTokens(second);

    if (a.size === 0 || b.size === 0) return 0;

    let intersection = 0;

    for (const token of a) {
      if (b.has(token)) intersection++;
    }

    const union = new Set([...a, ...b]).size;

    return union === 0 ? 0 : intersection / union;
  };

  const { data: recentNews, error: recentError } =
    await supabase
      .from("news")
      .select("id,title,source_id,source_url,category,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(100);

  if (recentError) {
    throw new Error(
      `Unable to check existing news: ${recentError.message}`
    );
  }

  const existingNews = Array.isArray(recentNews)
    ? recentNews
    : [];

  const existingSourceUrls = new Set(
    existingNews
      .map((item: any) => normalizeSourceId(String(item?.source_url || "")))
      .filter(Boolean)
  );

  for (const draft of drafts) {
    const sourceUrl = normalizeSourceId(draft.source_url);

    if (!sourceUrl) {
      console.log(
        `Skipping story without a valid source URL: ${draft.title}`
      );
      continue;
    }

    if (isGenericSourceUrl(sourceUrl)) {
      console.log(
        `Skipping generic source page: ${draft.source_url}`
      );
      continue;
    }

    const exactScoutSource = results.some(
      (result) =>
        normalizeSourceId(result.url) === sourceUrl
    );

    if (!exactScoutSource) {
      console.log(
        `Skipping story with unverified source URL: ${draft.source_url}`
      );
      continue;
    }

    const sourceId = sourceUrl;

    const exactDuplicate =
      existingSourceUrls.has(sourceUrl) ||
      existingNews.some(
        (item: any) =>
          normalizeSourceId(String(item.source_id || "")) ===
          sourceId
      );

    if (exactDuplicate) {
      console.log(
        `Skipping exact duplicate: ${draft.title}`
      );
      continue;
    }

    const similarDuplicate = existingNews.some(
      (item: any) => {
        if (!item?.title) return false;

        const score = similarity(
          draft.title,
          String(item.title)
        );

        return score >= 0.72;
      }
    );

    if (similarDuplicate) {
      console.log(
        `Skipping similar duplicate: ${draft.title}`
      );
      continue;
    }

    const { data, error } = await supabase
      .from("news")
      .insert({
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        category: draft.category,
        source_name: draft.source_name,
        source_url: sourceUrl,
        source_published_at: draft.source_published_at,
        scouted_at: scoutedAt,
        source_id: sourceId,
        published: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        console.log(
          `Skipping duplicate source_id: ${sourceId}`
        );
        continue;
      }

      throw new Error(
        `Unable to publish news: ${error.message}`
      );
    }

    if (data) {
      published.push(data);
      existingNews.push(data);
      existingSourceUrls.add(sourceUrl);
    }
  }

  return published;
}
export default {
  fetch: async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return json(
        {
          error: "Method not allowed.",
        },
        405
      );
    }

    try {
      const body = await req.json().catch(() => ({}));

      const requestedQuery =
        cleanText(body?.query);

      const requestedCategory =
        cleanText(body?.category);

      const scoutQueries = [
        {
          category: "Local & Community",
          query:
            "latest important local community news in Cameroon including communities humanitarian developments local events and public services",
        },
        {
          category: "Cameroon",
          query:
            "latest important Cameroon national news government society economy security and major developments",
        },
        {
          category: "Africa",
          query:
            "latest important news across Africa major developments African countries regional institutions and communities",
        },
        {
          category: "World",
          query:
            "latest important international world news major global developments",
        },
        {
          category: "Politics",
          query:
            "latest important political news elections governments diplomacy policy and political developments Cameroon Africa world",
        },
        {
          category: "Business & Finance",
          query:
            "latest business finance economy markets companies banking investment trade and entrepreneurship news Cameroon Africa world",
        },
        {
          category: "Sports",
          query:
            "latest sports news football basketball athletics tournaments competitions Cameroon Africa world",
        },
        {
          category: "Technology",
          query:
            "latest technology artificial intelligence digital innovation startups cybersecurity and technology news Cameroon Africa world",
        },
        {
          category: "Education",
          query:
            "latest education news schools universities scholarships training examinations research and learning Cameroon Africa",
        },
        {
          category: "Jobs & Opportunities",
          query:
            "latest jobs employment recruitment scholarships grants fellowships internships careers and professional opportunities Cameroon Africa",
        },
        {
          category: "Transport",
          query:
            "latest transport news roads traffic aviation railways public transport logistics and mobility Cameroon Africa",
        },
        {
          category: "Health",
          query:
            "latest health public health medical disease prevention healthcare and medical research news Cameroon Africa world",
        },
      ];

      let results: WebResult[] = [];

      const category =
        requestedCategory || "Other";

      if (requestedQuery) {
        results = await searchWeb(
          requestedQuery,
          6
        );
      } else {
        const seenUrls = new Set<string>();

        for (const scout of scoutQueries) {
          try {
            console.log(
              `Running news scout: ${scout.category}`
            );

            const found = await searchWeb(
              scout.query,
              4
            );

            for (const result of found) {
              const normalizedUrl =
                normalizeSourceId(result.url);

              if (
                !normalizedUrl ||
                seenUrls.has(normalizedUrl)
              ) {
                continue;
              }

              seenUrls.add(normalizedUrl);

              results.push({
                ...result,
                scoutCategory: scout.category,
              });
            }

            console.log(
              `${scout.category}: ${found.length} results`
            );
          } catch (error) {
            console.error(
              `Scout query failed for ${scout.category}:`,
              error
            );
          }
        }
        results = results
          .sort((a, b) => {
            const aTime = a.publishedAt
              ? Date.parse(a.publishedAt)
              : 0;

            const bTime = b.publishedAt
              ? Date.parse(b.publishedAt)
              : 0;

            return bTime - aTime;
          })
          .slice(0, 24);


        console.log(
          `Multi-category scout collected ${results.length} unique web results.`
        );
      }

      if (results.length === 0) {
        return json({
          success: true,
          searched: true,
          published: [],
          message: "No web results found.",
        });
      }

      const drafts =
        await summarizeWithOpenAI(
          results,
          category
        );

      const supabaseUrl =
        Deno.env.get("SUPABASE_URL");

      const supabaseServiceKey =
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
          "Supabase server credentials are not configured."
        );
      }

      const supabase = createClient(
        supabaseUrl,
        supabaseServiceKey
      );

      const scoutedAt = new Date().toISOString();

      const published = await publishNews(
        supabase,
        drafts,
        results,
        scoutedAt
      );

      return json({
        success: true,
        searched: true,
        sourceCount: results.length,
        draftCount: drafts.length,
        publishedCount: published.length,
        published,
        scoutedAt,
      });
    } catch (error) {
      console.error(
        "ECOS News Scout error:",
        error
      );

      return json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "News Scout failed.",
        },
        500
      );
    }
  },
};


































