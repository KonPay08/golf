/**
 * ゴルフのルールに関する定数定義
 */

export const GOLF_RULES = {
  /** 許可されるホール数（9ホールまたは18ホール） */
  HOLE_COUNTS: [9, 18] as const,

  /** 許可されるパー値（Par 3, 4, 5） */
  PAR_VALUES: [3, 4, 5] as const,

  /** デフォルトのパー値 */
  DEFAULT_PAR: 4 as const,

  /** ストローク数の範囲（最小1打、最大12打） */
  STROKE_RANGE: {
    MIN: 1,
    MAX: 12,
  } as const,

  /** スコア差分の定義 */
  SCORE_DIFF: {
    /** イーグル: パーより2打少ない */
    EAGLE: -2,
    /** バーディ: パーより1打少ない */
    BIRDIE: -1,
    /** パー: パーと同じ */
    PAR: 0,
  } as const,
} as const;

/**
 * 定数から導出される型定義
 */

/** ホール数の型（9 | 18） */
export type HoleCount = (typeof GOLF_RULES.HOLE_COUNTS)[number];

/** パー値の型（3 | 4 | 5） */
export type ParValue = (typeof GOLF_RULES.PAR_VALUES)[number];
