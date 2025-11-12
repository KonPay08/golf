/**
 * HTTP レスポンスの共通型定義
 */

export type SuccessResponse<T = unknown> = {
  data: T;
};

export type ErrorResponse = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};
