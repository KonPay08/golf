/**
 * ラウンド関連の型定義
 */

// ========================================
// Domain Types
// ========================================

/** ホール数の型（9 | 18） */
export type HoleCount = 9 | 18;

/** パー値の型（3 | 4 | 5） */
export type ParValue = 3 | 4 | 5;

// ========================================
// CreateRound (Command)
// ========================================

export type CreateRoundCommand = {
  date: string;
  n: HoleCount;
  courseName?: string;
};

export type CreateRoundResult = {
  roundId: string;
};

// ========================================
// EntryScore (Command)
// ========================================

export type EntryScoreCommand = {
  roundId: string;
  holeNumber: number;
  stroke: number;
};

export type EntryScoreResult = {
  roundId: string;
};

// ========================================
// SummarizeRound (Query)
// ========================================

export type SummarizeRoundQuery = {
  roundId: string;
};

export type SummarizeRoundResult = {
  roundId: string;
  date: string;
  gross: number;
  toPar: number;
  pars: number;
  birdies: number;
  eagles: number;
};

// ========================================
// GetRound (Query)
// ========================================

export type GetRoundQuery = {
  roundId: string;
};

export type GetRoundResult = {
  roundId: string;
  date: string;
  n: HoleCount;
  courseName?: string;
  holes: {
    number: number;
    par: number;
  }[];
  scores: {
    holeNumber: number;
    strokes: number;
  }[];
  summary: {
    gross: number;
    toPar: number;
    pars: number;
    birdies: number;
    eagles: number;
  };
};

// ========================================
// ListRounds (Query)
// ========================================

export type ListRoundsQuery = {
  // empty - no parameters needed
};

export type ListRoundsResult = {
  rounds: {
    roundId: string;
    date: string;
    courseName?: string;
    gross: number;
    toPar: number;
  }[];
};
