import type { HoleCount, ParValue } from "@golf/shared";

export type Hole = {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;
  par: ParValue;
};

export type HoleScore = {
  holeNumber: number;
  strokes: number;
};

export type Round = {
  id: string;
  date: string;
  n: HoleCount;
  holes: Hole[];
  scores: HoleScore[];
  courseName?: string;
};

export type RoundSummary = {
  gross: number;
  toPar: number;
  pars: number;
  birdies: number;
  eagles: number;
};