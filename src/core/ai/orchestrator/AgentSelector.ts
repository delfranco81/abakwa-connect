import type {
  AIIntent,
} from "./IntentResolver";

export type AIAgentId =
  | "government"
  | "housing"
  | "marketplace"
  | "finance"
  | "search";

export type AIAgentSelection = {
  agent: AIAgentId;
  confidence: number;
};

export class AgentSelector {
  static select(
    intent: AIIntent
  ): AIAgentSelection {
    switch (intent) {
      case "government":
        return {
          agent: "government",
          confidence: 1,
        };

      case "housing":
        return {
          agent: "housing",
          confidence: 1,
        };

      case "marketplace":
        return {
          agent: "marketplace",
          confidence: 1,
        };

      case "finance":
        return {
          agent: "finance",
          confidence: 1,
        };

      case "search":
        return {
          agent: "search",
          confidence: 0.9,
        };

      case "unknown":
      default:
        return {
          agent: "search",
          confidence: 0,
        };
    }
  }
}
