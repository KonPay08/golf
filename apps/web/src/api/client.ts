import type {
  CreateRoundCommand,
  CreateRoundResult,
  EntryScoreCommand,
  EntryScoreResult,
  GetRoundResult,
  ListRoundsResult,
  SuccessResponse,
  ErrorResponse,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

class ApiError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new ApiError(
      errorData.error.message,
      errorData.error.code,
      errorData.error.details
    );
  }

  const successData = (await response.json()) as SuccessResponse<T>;
  return successData.data;
}

// Create Round - ラウンド作成
export async function createRound(
  command: CreateRoundCommand
): Promise<CreateRoundResult> {
  return fetchApi<CreateRoundResult>("/rounds", {
    method: "POST",
    body: JSON.stringify(command),
  });
}

// Get Round - ラウンド詳細取得
export async function getRound(roundId: string): Promise<GetRoundResult> {
  return fetchApi<GetRoundResult>(`/rounds/${roundId}`);
}

// Entry Score - スコア入力
export async function entryScore(
  roundId: string,
  command: Omit<EntryScoreCommand, "roundId">
): Promise<EntryScoreResult> {
  return fetchApi<EntryScoreResult>(`/rounds/${roundId}/scores`, {
    method: "POST",
    body: JSON.stringify(command),
  });
}

// List Rounds - ラウンド一覧取得
export async function listRounds(): Promise<ListRoundsResult> {
  return fetchApi<ListRoundsResult>("/rounds");
}
