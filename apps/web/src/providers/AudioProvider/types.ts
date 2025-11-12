export type AudioName = "eagle" | "birdie" | "par";

export interface AudioContextValue {
  play: (name: AudioName) => void;
  stop: (name: AudioName) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  volume: number;
  isMuted: boolean;
  isLoaded: boolean;
}
