export type EcosKnowledgeDomain =
  | "ai"
  | "business"
  | "government"
  | "incident"
  | "learning"
  | "marketplace"
  | "platform"
  | "user";

export type EcosKnowledgeEntry = {
  id: string;

  domain: EcosKnowledgeDomain;

  name: string;

  description: string;

  keywords: string[];

  capabilities: string[];

  module?: string;

  service?: string;

  enabled: boolean;
};

export type EcosBrainState = {
  status:
    | "offline"
    | "starting"
    | "ready"
    | "error";

  initializedAt: string | null;

  entries: number;

  lastError: string | null;
};
