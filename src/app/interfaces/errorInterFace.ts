export interface TErrorSource {
  path: string;
  message: string;
}

export interface TErrorResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errorSource: TErrorSource[];
  stack?: string | undefined;
  error?: unknown;
}
