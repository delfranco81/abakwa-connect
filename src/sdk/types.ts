export interface SDKResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}