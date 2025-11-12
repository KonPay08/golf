import { Hole, Round, RoundSummary } from "~/rounds/domain/entities";
import type { HoleCount, ParValue } from "@golf/shared";
import { GOLF_RULES } from "~/rounds/domain/constants";

export function createRound({
  id,
  date,
  n,
  parDefault,
  courseName,
}: {
  id: string;
  date: string;
  n: HoleCount;
  parDefault?: ParValue;
  courseName?: string;
}): Round {
  if (!GOLF_RULES.HOLE_COUNTS.includes(n)) {
    throw new Error(`n must be ${GOLF_RULES.HOLE_COUNTS.join(' or ')}`);
  }
  const par = parDefault ?? GOLF_RULES.DEFAULT_PAR;
  if (!GOLF_RULES.PAR_VALUES.includes(par)) {
    throw new Error(`par must be ${GOLF_RULES.PAR_VALUES.join(', ')}`);
  }
  const holes: Hole[] = Array.from({ length: n }, (_, i) => ({
    number: (i + 1) as Hole["number"],
    par,
  }));

  return {
    id,
    date,
    n,
    holes,
    scores: [],
    courseName,
  };
}

export function entryScore({
  round,
  holeNumber,
  strokes,
}: {
  round: Round;
  holeNumber: number;
  strokes: number;
}): Round {
  if (holeNumber < 1 || holeNumber > round.n) {
    throw new Error(`holeNumber must be between 1 and ${round.n}`);
  }
  if (strokes < GOLF_RULES.STROKE_RANGE.MIN || strokes > GOLF_RULES.STROKE_RANGE.MAX) {
    throw new Error(`strokes must be between ${GOLF_RULES.STROKE_RANGE.MIN} and ${GOLF_RULES.STROKE_RANGE.MAX}`);
  }
  const existingIndex = round.scores.findIndex(s => s.holeNumber === holeNumber);
  const newScores = [...round.scores];
  if (existingIndex >= 0) {
    newScores[existingIndex] = { holeNumber, strokes };
  } else {
    newScores.push({ holeNumber, strokes });
  }
  return { ...round, scores: newScores };
}

export function summarizeRound(round: Round): RoundSummary {
  let gross = 0;
  let toPar = 0;
  let pars = 0;
  let birdies = 0;
  let eagles = 0;

  for (const score of round.scores) {
    const hole = round.holes.find(h => h.number === score.holeNumber);
    if (!hole) continue;
    gross += score.strokes;
    const diff = score.strokes - hole.par;
    toPar += diff;
    if (diff === GOLF_RULES.SCORE_DIFF.PAR) pars++;
    else if (diff === GOLF_RULES.SCORE_DIFF.BIRDIE) birdies++;
    else if (diff === GOLF_RULES.SCORE_DIFF.EAGLE) eagles++;
  }

  return { gross, toPar, pars, birdies, eagles };
}