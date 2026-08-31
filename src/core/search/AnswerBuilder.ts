import type {
  EcosIntent,
  EcosSearchResult,
} from "./SearchTypes";

export function buildEcosAnswer(
  query: string,
  intent: EcosIntent,
  results: EcosSearchResult[],
  totalResultCount = results.length
): string {
  if (!query.trim()) {
    return "Ask ECOS what you need, where you want it, who can help you, or how to get something done.";
  }

  if (totalResultCount === 0) {
    switch (intent) {
      case "government":
        return "I couldn't find a matching result yet.";

      case "education":
        return "I couldn't find a matching result yet.";

      case "housing":
        return "I couldn't find a matching result yet.";

      case "jobs":
        return "I couldn't find a matching result yet.";

      case "talent":
        return "I couldn't find a matching result yet.";

      default:
        return "I couldn't find a matching result yet.";
    }
  }

  return `I found ${totalResultCount} result${totalResultCount === 1 ? "" : "s"} that may be useful.`;
}
