import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, useReducedMotion } from "motion/react";
import type { HoleCount } from "@golf/shared";

export type CreateRoundModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { playedAt: string; holeCount: HoleCount }) => void;
};

export default function CreateRoundModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateRoundModalProps) {
  const reduced = useReducedMotion();
  const duration = (reduced ? 120 : 180) / 1000;

  const [playedAt, setPlayedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [holeCount, setHoleCount] = useState<HoleCount>(18);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ playedAt, holeCount });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl shadow-xl focus:outline-none"
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
            transition={{ duration }}
          >
            <form onSubmit={handleSubmit}>
              {/* Close Button */}
              <div className="absolute right-6 top-6 z-10">
                <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 5L5 15M5 5L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Dialog.Close>
              </div>

              {/* Visually hidden title for accessibility */}
              <Dialog.Title className="sr-only">
                新しいラウンドを作成
              </Dialog.Title>

              {/* Content */}
              <div className="px-6 pt-8 pb-6 space-y-6">
                {/* Play Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="playedAt"
                    className="block text-sm font-medium text-fg"
                  >
                    プレー日
                  </label>
                  <input
                    type="date"
                    id="playedAt"
                    value={playedAt}
                    onChange={(e) => setPlayedAt(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-fg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  />
                </div>

                {/* Hole Count */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-fg">ホール数</div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="holeCount"
                        value="9"
                        checked={holeCount === 9}
                        onChange={() => setHoleCount(9)}
                        className="w-5 h-5 text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-base text-fg">9ホール</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="holeCount"
                        value="18"
                        checked={holeCount === 18}
                        onChange={() => setHoleCount(18)}
                        className="w-5 h-5 text-brand focus:ring-2 focus:ring-brand focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-base text-fg">18ホール</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 active:scale-95"
                >
                  スコア入力を開始
                </button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
