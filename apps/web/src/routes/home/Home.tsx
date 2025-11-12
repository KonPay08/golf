import { useState } from "react";
import { useNavigate } from "react-router";
import type { HoleCount } from "@golf/shared";
import CreateRoundModal from "../../presentation/CreateRoundModal";
import { useCreateRound, useListRounds } from "../../api/hooks";

export default function Home() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createRoundMutation = useCreateRound();
  const { data: rounds, isLoading, error } = useListRounds();

  const handleCreateRound = async (data: { playedAt: string; holeCount: HoleCount }) => {
    try {
      const result = await createRoundMutation.mutateAsync({
        date: data.playedAt,
        n: data.holeCount,
      });

      // 作成成功後、スコア登録ページに遷移
      setIsModalOpen(false);
      navigate(`/score-registration?roundId=${result.roundId}`);
    } catch (error) {
      console.error("Failed to create round:", error);
      // TODO: エラーハンドリング（トーストなど）
    }
  };

  return (
    <div className="min-h-screen-safe bg-bg pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Past Rounds Section */}
        <div>
          <h2 className="text-xl font-bold text-fg mb-4">過去のラウンド</h2>

          {isLoading && (
            <div className="text-muted text-center py-12">読み込み中...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-12">
              エラーが発生しました
            </div>
          )}

          {!isLoading && !error && rounds && rounds.rounds.length === 0 && (
            <div className="text-muted text-center py-12">
              まだラウンドが登録されていません
            </div>
          )}

          {!isLoading && !error && rounds && rounds.rounds.length > 0 && (
            <div className="space-y-3">
              {rounds.rounds.map((round) => (
                <button
                  key={round.roundId}
                  onClick={() => navigate(`/score-registration?roundId=${round.roundId}`)}
                  className="w-full bg-white border border-border rounded-xl p-4 hover:border-brand hover:shadow-md transition-all active:scale-[0.98] text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-medium text-fg">
                          {new Date(round.date).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        {round.courseName && (
                          <span className="text-sm text-muted">
                            {round.courseName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-fg num-tabular">
                          スコア: <span className="font-semibold">{round.gross}</span>
                        </span>
                        <span
                          className={[
                            "num-tabular font-semibold",
                            round.toPar === 0
                              ? "text-gray-600"
                              : round.toPar < 0
                              ? "text-blue-600"
                              : "text-red-600",
                          ].join(" ")}
                        >
                          {round.toPar > 0 ? "+" : ""}{round.toPar}
                        </span>
                      </div>
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-muted"
                    >
                      <path
                        d="M7 4L13 10L7 16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Round Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-linear-to-t from-bg via-bg to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 5V15M5 10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            新しいラウンドを作成
          </button>
        </div>
      </div>

      {/* Create Round Modal */}
      <CreateRoundModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateRound}
      />
    </div>
  );
}