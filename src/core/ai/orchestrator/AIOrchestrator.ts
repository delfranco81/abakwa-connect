import type {
  EcosIntent,
  EcosAction,
} from "../../search/SearchTypes";

import {
  AIIntentResolver,
  type AIIntentResult,
} from "./IntentResolver";

import {
  AgentSelector,
  type AIAgentSelection,
} from "./AgentSelector";

import {
  TaskPlanner,
  type AITask,
} from "./TaskPlanner";

import {
  WorkflowEngine,
  type AIWorkflow,
} from "./WorkflowEngine";

export type AIOrchestrationResult = {
  sourceIntent: EcosIntent;
  sourceAction: EcosAction;

  aiIntent: AIIntentResult;
  agent: AIAgentSelection;
  task: AITask;
  workflow: AIWorkflow;
};

export class AIOrchestrator {
  static orchestrate(
    intent: EcosIntent,
    action: EcosAction
  ): AIOrchestrationResult {
    /*
     * -------------------------------------------------------
     * AI INTENT
     * -------------------------------------------------------
     */

    const aiIntent =
      AIIntentResolver.resolve(intent);

    /*
     * -------------------------------------------------------
     * AGENT
     * -------------------------------------------------------
     */

    const agent =
      AgentSelector.select(
        aiIntent.intent
      );

    /*
     * -------------------------------------------------------
     * TASK
     * -------------------------------------------------------
     */

    const task =
      TaskPlanner.plan(action);

    /*
     * -------------------------------------------------------
     * WORKFLOW
     * -------------------------------------------------------
     */

    const workflow =
      WorkflowEngine.create(
        agent.agent,
        task
      );

    return {
      sourceIntent: intent,
      sourceAction: action,
      aiIntent,
      agent,
      task,
      workflow,
    };
  }
}
