import type { EcosIntent } from "../../search/SearchTypes";

export type AIIntent =
  | "government"
  | "housing"
  | "marketplace"
  | "finance"
  | "search"
  | "unknown";

export type AIIntentResult = {
  intent: AIIntent;
  sourceIntent: EcosIntent;
  confidence: number;
};

export class AIIntentResolver {
  static resolve(
    intent: EcosIntent
  ): AIIntentResult {
    switch (intent) {
      case "government":
        return {
          intent: "government",
          sourceIntent: intent,
          confidence: 1,
        };

      case "housing":
        return {
          intent: "housing",
          sourceIntent: intent,
          confidence: 1,
        };

      case "discover":
      case "service":
      case "talent":
      case "location":
      case "education":
      case "jobs":
      case "community":
      case "tourism":
      case "food":
      case "transport":
        return {
          intent: "search",
          sourceIntent: intent,
          confidence: 0.9,
        };

      case "unknown":
      default:
        return {
          intent: "unknown",
          sourceIntent: intent,
          confidence: 0,
        };
    }
  }
}
