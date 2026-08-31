import type {
  EcosAction,
  EcosIntent,
  EcosSearchResponse,
} from "../search/SearchTypes";

import type {
  AIOrchestrationResult,
} from "../ai/orchestrator/AIOrchestrator";

export type EcosKernelStatus =
  | "offline"
  | "starting"
  | "ready"
  | "error";

export type EcosKernelRequest = {
  query: string;
  page?: number;
};

export type EcosKernelResponse = {
  status: EcosKernelStatus;
  query: string;
  intent: EcosIntent;
  action: EcosAction;
  response: EcosSearchResponse;

  /*
   * AI orchestration information.
   *
   * The existing search response remains the
   * source of search results. The AI layer adds
   * planning and workflow information around it.
   */
  ai?: AIOrchestrationResult;
};

export type EcosKernelState = {
  status: EcosKernelStatus;
  startedAt: string | null;
  lastError: string | null;
};
