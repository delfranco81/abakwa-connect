import type {
  AIAgentId,
} from "./AgentSelector";

import type {
  AITask,
} from "./TaskPlanner";

export type AIWorkflowType =
  | "search"
  | "government"
  | "housing"
  | "marketplace"
  | "finance"
  | "unknown";

export type AIWorkflow = {
  type: AIWorkflowType;
  agent: AIAgentId;
  task: AITask;
  requiresConfirmation: boolean;
};

export class WorkflowEngine {
  static create(
    agent: AIAgentId,
    task: AITask
  ): AIWorkflow {
    let type: AIWorkflowType;

    switch (agent) {
      case "government":
        type = "government";
        break;

      case "housing":
        type = "housing";
        break;

      case "marketplace":
        type = "marketplace";
        break;

      case "finance":
        type = "finance";
        break;

      case "search":
        type = "search";
        break;

      default:
        type = "unknown";
    }

    return {
      type,
      agent,
      task,
      requiresConfirmation:
        task.requiresConfirmation,
    };
  }
}
