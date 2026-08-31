export type AIProviderRequest = {
  prompt: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
};

export type AIProviderResponse = {
  text: string;
  provider: string;
  model?: string;
};

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;

  initialize(): Promise<void>;

  generate(
    request: AIProviderRequest
  ): Promise<AIProviderResponse>;

  isReady(): boolean;
}
