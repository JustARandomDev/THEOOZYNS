import { useSyncExternalStore } from "react";
import { sound } from "@/lib/sound";

export function useMuted(): [boolean, () => void] {
  const muted = useSyncExternalStore(
    (cb) => sound.subscribe(cb),
    () => sound.isMuted(),
    () => sound.isMuted(),
  );
  return [muted, () => sound.toggleMuted()];
}
