import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useMuted } from "@/hooks/useMuted";

export function SoundToggle() {
  const [muted, toggle] = useMuted();
  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Unmute" : "Mute"}
      title={muted ? "Sound off" : "Sound on"}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-card/80 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all flex items-center justify-center shadow-lg"
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}
