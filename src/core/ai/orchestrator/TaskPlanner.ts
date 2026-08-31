import type {
  EcosAction,
} from "../../search/SearchTypes";

export type AITaskType =
  | "discover"
  | "find"
  | "register"
  | "create"
  | "book"
  | "apply"
  | "contact"
  | "manage"
  | "unknown";

export type AITask = {
  type: AITaskType;
  requiresConfirmation: boolean;
};

export class TaskPlanner {
  static plan(
    action: EcosAction
  ): AITask {
    switch (action) {
      case "discover":
        return {
          type: "discover",
          requiresConfirmation: false,
        };

      case "find":
        return {
          type: "find",
          requiresConfirmation: false,
        };

      case "register":
        return {
          type: "register",
          requiresConfirmation: true,
        };

      case "create":
        return {
          type: "create",
          requiresConfirmation: true,
        };

      case "book":
        return {
          type: "book",
          requiresConfirmation: true,
        };

      case "apply":
        return {
          type: "apply",
          requiresConfirmation: true,
        };

      case "contact":
        return {
          type: "contact",
          requiresConfirmation: false,
        };

      case "manage":
        return {
          type: "manage",
          requiresConfirmation: true,
        };

      case "unknown":
      default:
        return {
          type: "unknown",
          requiresConfirmation: false,
        };
    }
  }
}
