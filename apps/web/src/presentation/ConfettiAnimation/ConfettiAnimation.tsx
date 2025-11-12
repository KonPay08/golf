import { useEffect, useRef, useState } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import { motion, AnimatePresence } from "motion/react";
import confettiData from "../../assets/confetti.json";

export interface ConfettiAnimationProps {
  /** アニメーションを表示するかどうか */
  isVisible: boolean;
  /** アニメーション終了時のコールバック */
  onComplete?: () => void;
  /** アニメーション再生時間（ミリ秒、デフォルト: 2000ms） */
  duration?: number;
}

/**
 * 画面中央に Lottie 紙吹雪アニメーションを表示するコンポーネント
 *
 * @example
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 *
 * return (
 *   <ConfettiAnimation
 *     isVisible={showConfetti}
 *     onComplete={() => setShowConfetti(false)}
 *   />
 * );
 * ```
 */
export default function ConfettiAnimation({
  isVisible,
  onComplete,
  duration = 2000,
}: ConfettiAnimationProps) {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<AnimationItem | null>(null);

  // isVisible の変化を監視して show を更新
  useEffect(() => {
    if (isVisible) {
      setShow(true);

      // 指定時間後に自動で非表示
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  // Lottie アニメーションのマウント/アンマウント
  useEffect(() => {
    if (show && containerRef.current && !animationRef.current) {
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,
        animationData: confettiData,
      });
    }

    // クリーンアップ
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div ref={containerRef} className="w-full h-full max-w-md" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
