import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRound, entryScore, getRound, listRounds } from "./client";
import type { CreateRoundCommand, EntryScoreCommand, GetRoundResult } from "./types";

// Query Keys
export const roundKeys = {
  all: ["rounds"] as const,
  details: () => [...roundKeys.all, "detail"] as const,
  detail: (id: string) => [...roundKeys.details(), id] as const,
  list: () => [...roundKeys.all, "list"] as const,
};

// useCreateRound - ラウンド作成
export function useCreateRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateRoundCommand) => createRound(command),
    onSuccess: () => {
      // ラウンド一覧を無効化（将来実装される場合に備えて）
      queryClient.invalidateQueries({ queryKey: roundKeys.all });
    },
  });
}

// useRound - ラウンド詳細取得
export function useRound(roundId: string) {
  return useQuery({
    queryKey: roundKeys.detail(roundId),
    queryFn: () => getRound(roundId),
    enabled: !!roundId,
  });
}

// useEntryScore - スコア入力（楽観的更新付き）
export function useEntryScore(roundId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: Omit<EntryScoreCommand, "roundId">) =>
      entryScore(roundId, command),
    onMutate: async (newScore) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: roundKeys.detail(roundId) });

      // 現在のデータを保存（ロールバック用）
      const previousRound = queryClient.getQueryData<GetRoundResult>(
        roundKeys.detail(roundId)
      );

      // 楽観的更新
      if (previousRound) {
        queryClient.setQueryData<GetRoundResult>(
          roundKeys.detail(roundId),
          (old) => {
            if (!old) return old;

            // スコアを更新または追加
            const existingScoreIndex = old.scores.findIndex(
              (s) => s.holeNumber === newScore.holeNumber
            );

            const updatedScores = [...old.scores];
            if (existingScoreIndex >= 0) {
              updatedScores[existingScoreIndex] = {
                holeNumber: newScore.holeNumber,
                strokes: newScore.stroke,
              };
            } else {
              updatedScores.push({
                holeNumber: newScore.holeNumber,
                strokes: newScore.stroke,
              });
            }

            // サマリーを再計算
            const totalStrokes = updatedScores.reduce(
              (sum, s) => sum + s.strokes,
              0
            );
            const totalPar = old.holes.reduce((sum, h) => sum + h.par, 0);
            const toPar = totalStrokes - totalPar;

            let pars = 0;
            let birdies = 0;
            let eagles = 0;

            updatedScores.forEach((score) => {
              const hole = old.holes.find((h) => h.number === score.holeNumber);
              if (hole) {
                const diff = score.strokes - hole.par;
                if (diff === 0) pars++;
                else if (diff === -1) birdies++;
                else if (diff <= -2) eagles++;
              }
            });

            return {
              ...old,
              scores: updatedScores,
              summary: {
                gross: totalStrokes,
                toPar,
                pars,
                birdies,
                eagles,
              },
            };
          }
        );
      }

      return { previousRound };
    },
    onError: (_err, _newScore, context) => {
      // エラー時はロールバック
      if (context?.previousRound) {
        queryClient.setQueryData(
          roundKeys.detail(roundId),
          context.previousRound
        );
      }
    },
    onSettled: () => {
      // 完了後にサーバーから最新データを取得
      queryClient.invalidateQueries({ queryKey: roundKeys.detail(roundId) });
    },
  });
}

// useListRounds - ラウンド一覧取得
export function useListRounds() {
  return useQuery({
    queryKey: roundKeys.list(),
    queryFn: () => listRounds(),
  });
}