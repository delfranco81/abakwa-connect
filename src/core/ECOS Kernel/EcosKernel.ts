import { Logger } from "../logging";

import {
  BrainBootstrap,
  BrainRegistry,
} from "../ECOS Brain/index";

import {
  searchEverydayConnect,
} from "../search/SearchEngine";

import {
  AIOrchestrator,
} from "../ai/orchestrator/AIOrchestrator";

import type {
  EcosKernelRequest,
  EcosKernelResponse,
  EcosKernelState,
} from "./EcosKernelTypes";

export class EcosKernel {
  private static state: EcosKernelState = {
    status: "offline",
    startedAt: null,
    lastError: null,
  };

  /**
   * Start the ECOS intelligence layer.
   *
   * The platform Kernel remains responsible for the
   * overall application lifecycle.
   *
   * ECOS Kernel is responsible for initializing the
   * ECOS intelligence foundation.
   */
  static async boot(): Promise<void> {
    if (
      this.state.status ===
      "ready"
    ) {
      Logger.warn(
        "ECOS Kernel already started."
      );

      return;
    }

    Logger.info(
      "Booting ECOS Kernel..."
    );

    this.state.status =
      "starting";

    this.state.lastError =
      null;

    try {
      /*
       * -------------------------------------------------------
       * ECOS BRAIN
       * -------------------------------------------------------
       */

      Logger.info(
        "Initializing ECOS Brain..."
      );

      BrainBootstrap.initialize();

      if (
        !BrainRegistry.isReady()
      ) {
        throw new Error(
          "ECOS Brain failed to initialize."
        );
      }

      Logger.success(
        `ECOS Brain connected with ${BrainRegistry.getState().entries} knowledge entries.`
      );

      /*
       * -------------------------------------------------------
       * SEARCH ENGINE
       * -------------------------------------------------------
       *
       * The existing search engine remains the actual
       * search implementation.
       */

      Logger.info(
        "Connecting ECOS Search Engine..."
      );

      /*
       * -------------------------------------------------------
       * AI ORCHESTRATOR
       * -------------------------------------------------------
       *
       * AI orchestration is connected at request time.
       * The existing search engine remains authoritative
       * for intent and action resolution.
       */

      Logger.info(
        "Connecting ECOS AI Orchestrator..."
      );

      /*
       * -------------------------------------------------------
       * KERNEL READY
       * -------------------------------------------------------
       */

      this.state.status =
        "ready";

      this.state.startedAt =
        new Date().toISOString();

      Logger.success(
        "ECOS Kernel Ready"
      );
    } catch (error) {
      this.state.status =
        "error";

      this.state.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      Logger.error(
        `ECOS Kernel startup failed: ${this.state.lastError}`
      );

      throw error;
    }
  }

  /**
   * Process a request through ECOS.
   *
   * The Kernel is the orchestration boundary.
   *
   * SearchEngine remains the current search
   * implementation and source of search results.
   *
   * AIOrchestrator adds intelligent planning around
   * the resolved intent and action.
   */
  static async process(
    request: EcosKernelRequest
  ): Promise<EcosKernelResponse> {
    const query =
      request.query.trim();

    if (
      this.state.status !==
      "ready"
    ) {
      await this.boot();
    }

    try {
      Logger.info(
        `ECOS processing request: ${query}`
      );

      const response =
        await searchEverydayConnect(
          query,
          request.page ?? 1
        );

      /*
       * -------------------------------------------------------
       * AI ORCHESTRATION
       * -------------------------------------------------------
       *
       * SearchEngine remains authoritative for the
       * resolved intent and action.
       */

      const ai =
        AIOrchestrator.orchestrate(
          response.intent,
          response.action
        );

      Logger.info(
        `ECOS request resolved: intent=${response.intent}, action=${response.action}, agent=${ai.agent.agent}, task=${ai.task.type}`
      );

      return {
        status: "ready",

        query,

        intent:
          response.intent,

        action:
          response.action,

        response,

        ai,
      };
    } catch (error) {
      this.state.status =
        "error";

      this.state.lastError =
        error instanceof Error
          ? error.message
          : String(error);

      Logger.error(
        `ECOS request failed: ${this.state.lastError}`
      );

      throw error;
    }
  }

  static getState(): EcosKernelState {
    return {
      ...this.state,
    };
  }

  static isReady(): boolean {
    return (
      this.state.status ===
      "ready"
    );
  }

  static reset(): void {
    this.state = {
      status: "offline",
      startedAt: null,
      lastError: null,
    };

    BrainBootstrap.reset();
  }
}
