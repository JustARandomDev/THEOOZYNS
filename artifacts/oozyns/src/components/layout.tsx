import React, { useEffect } from "react";
import swirlUrl from "../assets/swirl.png";
import { SoundToggle } from "./sound-toggle";
import { installGlobalUISounds } from "@/lib/sound";

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => installGlobalUISounds(), []);
  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      <SoundToggle />
      {/* Subtle swirl pattern, tiled, very low opacity to fit the dark warm style */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url(${swirlUrl})`,
          backgroundSize: "520px 520px",
          backgroundRepeat: "repeat",
          mixBlendMode: "screen",
        }}
      />
      {/* Soft radial vignette to focus the center */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Grain on top */}
      <div className="fixed inset-0 bg-noise z-0 opacity-[0.03] pointer-events-none"></div>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto px-6 py-12 md:py-24">
          {children}
        </div>
      </main>
    </div>
  );
}
