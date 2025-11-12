import { createContext } from "react";
import type { AudioContextValue, AudioName } from "./types";

export const AudioContext = createContext<AudioContextValue | null>(null);

export const AUDIO_FILES: Partial<Record<AudioName, string>> = {
  eagle: "/par.mp3",
  birdie: "/par.mp3",
  par: "/par.mp3",
};

export const STORAGE_KEY_MUTED = "golf-audio-muted";
export const STORAGE_KEY_VOLUME = "golf-audio-volume";
