import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import ScoreSummary from "../../presentation/ScoreSummary";
import ScoreTable, { type ScoreRow } from "../../presentation/ScoreTable";
import SwitchTabs, { type HalfTab } from "../../presentation/SwitchTabs";
import ScoreInput from "../../presentation/ScoreInput";
import FocusNavigator from "../../presentation/FocusNavigator";
import { useRound, useEntryScore } from "../../api";
import useScoreTableScroll from "./useScoreTableScroll";

const COLUMNS = [
  { id: "hole", header: "ホール", align: "center" as const, cell: (r: ScoreRow) => r.hole },
  { id: "par", header: "Par", align: "center" as const, numeric: true, cell: (r: ScoreRow) => r.par },
  { id: "score", header: "スコア", align: "center" as const, numeric: true, cell: (r: ScoreRow) => r.score ?? "−" },
];

export default function ScoreRegistration() {
  const [searchParams] = useSearchParams();
  const roundId = searchParams.get("roundId") || "";

  const [courseType, setCourseType] = useState<HalfTab>("OUT");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [pendingScore, setPendingScore] = useState<{ holeNumber: number; stroke: number } | null>(null);

  const { data: round, isLoading, error } = useRound(roundId);
  const entryScoreMutation = useEntryScore(roundId);

  const {
    topRegionRef,
    dockRef,
    upArrowRef,
    scoreInputRef,
    tableWrapperRef,
    topSpacerRef,
    bottomSpacerRef,
    setHeaderRef,
    getRowRef,
    tableWrapperStyle,
  } = useScoreTableScroll({
    focusedIndex,
    courseType,
    enabled: Boolean(round),
  });

  const allRows: ScoreRow[] = useMemo(() => round?.holes.map((hole) => {
    const score = round?.scores.find((s) => s.holeNumber === hole.number);
    return {
      hole: hole.number,
      par: hole.par,
      score: score?.strokes,
    };
  }) ?? [], [round]);

  const outRows = useMemo(() => allRows.filter((r) => r.hole <= 9), [allRows]);
  const inRows = useMemo(() => allRows.filter((r) => r.hole > 9), [allRows]);

  const summary = useMemo(() => {
    if (!round) return { totalScore: 0, toPar: 0, birdies: 0, pars: 0, bogeys: 0 };

    const bogeys = allRows.filter((row) => {
      if (row.score === undefined) return false;
      const diff = row.score - row.par;
      return diff >= 1;
    }).length;

    return {
      totalScore: round.summary.gross,
      toPar: round.summary.toPar,
      birdies: round.summary.birdies,
      pars: round.summary.pars,
      bogeys,
    };
  }, [allRows, round]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error || !round) {
    return (
      <div className="min-h-screen bg-bg text-fg flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-500">
            エラーが発生しました: {error?.message || "ラウンドが見つかりません"}
          </div>
        </div>
      </div>
    );
  }

  const rows = courseType === "OUT" ? outRows : inRows;

  const handleScoreChange = (value: number) => {
    const currentHole = rows[focusedIndex];
    if (currentHole) {
      setPendingScore({
        holeNumber: currentHole.hole,
        stroke: value,
      });
    }
  };

  const savePendingScore = () => {
    if (pendingScore) {
      entryScoreMutation.mutate(pendingScore);
      setPendingScore(null);
    }
  };

  const handleCourseTypeChange = (next: HalfTab) => {
    savePendingScore();
    setCourseType(next);
    setFocusedIndex(0);
  };

  const handleRowFocusSelect = (index: number) => {
    savePendingScore();
    setFocusedIndex(index);
  };

  const handleFocusNavigation = (direction: "up" | "down") => {
    savePendingScore();

    if (direction === "down") {
      if (focusedIndex === rows.length - 1) {
        if (courseType === "OUT") {
          setCourseType("IN");
          setFocusedIndex(0);
        }
      } else {
        setFocusedIndex(focusedIndex + 1);
      }
    } else {
      if (focusedIndex === 0) {
        if (courseType === "IN") {
          setCourseType("OUT");
          setFocusedIndex(outRows.length - 1);
        }
      } else {
        setFocusedIndex(focusedIndex - 1);
      }
    }
  };

  return (
    <div className="h-screen-safe flex flex-col bg-bg text-fg">
      {/* Top region: Tabs + Summary (fixed height) */}
      <div ref={topRegionRef} className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-bg">
        <div className="max-w-[640px] mx-auto space-y-4">
          {/* OUT/IN タブ */}
          <SwitchTabs value={courseType} onChange={handleCourseTypeChange} />

          {/* スコアサマリー */}
          <ScoreSummary
            totalScore={summary.totalScore}
            toPar={summary.toPar}
            birdies={summary.birdies}
            pars={summary.pars}
            bogeys={summary.bogeys}
          />
        </div>
      </div>

      {/* スコア表（中央スクロール領域） */}
      <div
        ref={tableWrapperRef}
        className="relative flex-1 overflow-y-auto px-4 pt-2 scrollbars-on-hover"
        style={tableWrapperStyle}
      >
        <div className="max-w-[640px] mx-auto">
          {/* 先頭行をフォーカス帯に収めるスペーサー */}
          <div ref={topSpacerRef} style={{ height: "0px" }} aria-hidden="true" />

          <ScoreTable
            rows={rows}
            columns={COLUMNS}
            focusedIndex={focusedIndex}
            onFocusChange={handleRowFocusSelect}
            getHeaderRef={setHeaderRef}
            getRowRef={getRowRef}
          />

          {/* 末尾行をフォーカス帯に収めるスペーサー */}
          <div ref={bottomSpacerRef} style={{ height: "0px" }} aria-hidden="true" />
        </div>
      </div>

      {/* 下部 UI（ドック固定） */}
      <div
        ref={dockRef}
        className="fixed bottom-0 left-0 right-0 flex justify-center pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex flex-col items-center gap-2">
          {/* 上矢印ナビゲーター */}
          <FocusNavigator
            ref={upArrowRef}
            direction="up"
            onClick={() => handleFocusNavigation("up")}
            disabled={focusedIndex === 0 && courseType === "OUT"}
          />

          {/* スコア入力 */}
          <ScoreInput
            ref={scoreInputRef}
            value={
              pendingScore?.holeNumber === rows[focusedIndex]?.hole
                ? pendingScore.stroke
                : rows[focusedIndex]?.score
            }
            par={rows[focusedIndex]?.par ?? 4}
            onChange={handleScoreChange}
          />

          {/* 下矢印ナビゲーター */}
          <FocusNavigator
            direction="down"
            onClick={() => handleFocusNavigation("down")}
            disabled={focusedIndex === rows.length - 1 && courseType === "IN"}
          />
        </div>
      </div>
    </div>
  );
}
