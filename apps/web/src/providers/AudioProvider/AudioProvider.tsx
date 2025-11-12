import { useEffect, useRef, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { AudioContext, AUDIO_FILES, STORAGE_KEY_MUTED, STORAGE_KEY_VOLUME } from "./AudioContext";
import type { AudioName, AudioContextValue } from "./types";

export default function AudioProvider({ children }: { children: ReactNode }) {
  // 音声オブジェクトの Map を管理
  const audioRefs = useRef<Map<AudioName, HTMLAudioElement>>(new Map());

  // LocalStorage から初期値を取得
  const [isMuted, setMutedState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MUTED);
    return saved ? JSON.parse(saved) : false;
  });

  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
    return saved ? parseFloat(saved) : 0.5;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // 音声ファイルのプリロード
  useEffect(() => {
    let loadedCount = 0;
    const totalCount = Object.keys(AUDIO_FILES).length;

    Object.entries(AUDIO_FILES).forEach(([name, src]) => {
      if (!src) return;

      const audio = new Audio(src);
      audio.volume = volume;
      audio.preload = "auto";

      // ロード完了を監視
      audio.addEventListener("canplaythrough", () => {
        loadedCount++;
        if (loadedCount === totalCount) {
          setIsLoaded(true);
        }
      });

      audioRefs.current.set(name as AudioName, audio);
    });

    // クリーンアップ
    return () => {
      const audios = audioRefs.current;
      audios.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audios.clear();
    };
  }, [volume]);

  // 音量変更時に全音声に反映
  useEffect(() => {
    audioRefs.current.forEach((audio) => {
      audio.volume = volume;
    });
  }, [volume]);

  // 音声再生
  const play = useCallback((name: AudioName) => {
    if (isMuted) return;

    const audio = audioRefs.current.get(name);
    if (!audio) {
      console.warn(`Audio "${name}" not found`);
      return;
    }

    // 重複再生のため最初から再生
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error(`Failed to play audio "${name}":`, error);
    });
  }, [isMuted]);

  // 音声停止
  const stop = useCallback((name: AudioName) => {
    const audio = audioRefs.current.get(name);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  // 音量設定（LocalStorage に保存）
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(STORAGE_KEY_VOLUME, clampedVolume.toString());
  }, []);

  // ミュート設定（LocalStorage に保存）
  const setMuted = useCallback((muted: boolean) => {
    setMutedState(muted);
    localStorage.setItem(STORAGE_KEY_MUTED, JSON.stringify(muted));
  }, []);

  const value: AudioContextValue = {
    play,
    stop,
    setVolume,
    setMuted,
    volume,
    isMuted,
    isLoaded,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
