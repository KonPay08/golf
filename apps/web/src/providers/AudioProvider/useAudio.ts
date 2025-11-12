import { useContext } from "react";
import { AudioContext } from "./AudioContext";
import type { AudioContextValue } from "./types";

/**
 * AudioProvider 内で音声制御機能を使用するためのカスタムフック
 *
 * @throws {Error} AudioProvider の外で使用された場合
 * @returns {AudioContextValue} 音声制御のための API
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { play, isMuted, setMuted } = useAudio();
 *
 *   return (
 *     <button onClick={() => play("birdie")}>
 *       バーディー音を鳴らす
 *     </button>
 *   );
 * }
 * ```
 */
export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
