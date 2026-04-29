import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import bsodUrl from "@assets/image_1777497364773.png";
import jackpotUrl from "@assets/jackpot_1777497290109.mp3";
import { useMuted } from "@/hooks/useMuted";

type Phase = "bsod" | "rave" | "fading";

const DROP_DELAY_MS = 14500;
const FADE_OUT_MS = 1800;
const MIN_RAVE_MS = 6000;
const TARGET_VOL = 0.6;

const RAVE_COLORS = [
  "#ff00aa",
  "#00ffd9",
  "#ffd000",
  "#ff4400",
  "#9900ff",
  "#00ff66",
];

function BsodScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.08 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ backgroundColor: "#0000aa" }}
    >
      <img
        src={bsodUrl}
        alt=""
        className="max-w-[92%] max-h-[92%] object-contain"
        style={{ imageRendering: "pixelated" }}
        draggable={false}
      />
    </motion.div>
  );
}

function RaveScreen({ winSrc }: { winSrc?: string }) {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setColorIdx((v) => (v + 1) % RAVE_COLORS.length),
      95,
    );
    return () => window.clearInterval(id);
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1.4 + Math.random() * 2.2,
        size: 50 + Math.random() * 90,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: RAVE_COLORS[colorIdx],
        transition: "background-color 60ms linear",
      }}
      animate={{
        x: [0, -12, 14, -10, 11, -6, 0],
        y: [0, -7, 9, -5, 6, -3, 0],
      }}
      transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
    >
      {/* Scanlines for a grimy CRT feel */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, transparent 2px, transparent 4px)",
        }}
      />

      {/* Center pulsing 777 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ scale: [1, 1.28, 0.94, 1.18, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span
          className="font-display font-black italic text-white select-none"
          style={{
            fontSize: "clamp(120px, 26vw, 420px)",
            WebkitTextStroke: "6px black",
            textShadow:
              "0 0 40px rgba(255,255,255,0.9), 0 0 90px rgba(255,255,255,0.6)",
            letterSpacing: "-0.04em",
          }}
        >
          777
        </span>
      </motion.div>

      {/* Top banner */}
      <motion.div
        className="absolute top-[6%] left-0 right-0 text-center pointer-events-none overflow-hidden"
        animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="font-display font-black uppercase italic text-white text-4xl md:text-7xl tracking-tight whitespace-nowrap"
          style={{ WebkitTextStroke: "3px black" }}
        >
          GOLD GOLD GOLD GOLD
        </div>
      </motion.div>

      {/* Bottom banner */}
      <motion.div
        className="absolute bottom-[6%] left-0 right-0 text-center pointer-events-none overflow-hidden"
        animate={{ scale: [1, 1.1, 1], rotate: [3, -3, 3] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="font-display font-black uppercase italic text-white text-4xl md:text-7xl tracking-tight whitespace-nowrap"
          style={{ WebkitTextStroke: "3px black" }}
        >
          JACKPOT JACKPOT JACKPOT
        </div>
      </motion.div>

      {/* Symbol confetti rain */}
      {winSrc && (
        <div className="absolute inset-0 pointer-events-none">
          {confetti.map((c) => (
            <motion.img
              key={c.id}
              src={winSrc}
              alt=""
              className="absolute top-0"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.size,
                filter:
                  "drop-shadow(0 0 12px rgba(255,255,255,0.7)) drop-shadow(0 0 4px rgba(0,0,0,0.7))",
              }}
              initial={{ y: -300, rotate: c.rotate }}
              animate={{ y: "120vh", rotate: c.rotate + 720 }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                repeat: Infinity,
                ease: "linear",
              }}
              draggable={false}
            />
          ))}
        </div>
      )}

      {/* Edge flash overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 120px 40px rgba(255,255,255,0.7)",
          mixBlendMode: "overlay",
        }}
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 0.25, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export function WinExperience({
  active,
  winSymbol,
  onEnd,
}: {
  active: boolean;
  winSymbol?: { src: string } | null;
  onEnd: () => void;
}) {
  const [muted] = useMuted();
  const [phase, setPhase] = useState<Phase>("bsod");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const fadeRafRef = useRef<number | null>(null);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    if (!active) return;

    setPhase("bsod");

    const audio = new Audio(jackpotUrl);
    audio.volume = muted ? 0 : TARGET_VOL;
    audioRef.current = audio;
    void audio.play().catch(() => {
      // autoplay blocked — user has already gestured (clicked SPIN), so unlikely
    });

    const t1 = window.setTimeout(() => setPhase("rave"), DROP_DELAY_MS);
    timersRef.current.push(t1);

    const scheduleEnd = () => {
      const dur =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : 14000;
      const totalLength = Math.max(DROP_DELAY_MS + MIN_RAVE_MS, dur);
      const fadeStart = totalLength - FADE_OUT_MS;

      const t2 = window.setTimeout(
        () => {
          setPhase("fading");
          const startVol = audio.volume;
          const t0 = performance.now();
          const step = (now: number) => {
            const t = Math.min(1, (now - t0) / FADE_OUT_MS);
            audio.volume = Math.max(0, startVol * (1 - t));
            if (t < 1) {
              fadeRafRef.current = requestAnimationFrame(step);
            } else {
              audio.pause();
              fadeRafRef.current = null;
            }
          };
          fadeRafRef.current = requestAnimationFrame(step);
        },
        Math.max(0, fadeStart),
      );

      const t3 = window.setTimeout(
        () => {
          onEndRef.current();
        },
        totalLength + 100,
      );

      timersRef.current.push(t2, t3);
    };

    if (audio.readyState >= 1) {
      scheduleEnd();
    } else {
      audio.addEventListener("loadedmetadata", scheduleEnd, { once: true });
      // Fallback if metadata never loads
      const tFallback = window.setTimeout(scheduleEnd, 2000);
      timersRef.current.push(tFallback);
    }

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // Only re-run when activation flips; volume changes handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Live mute sync
  useEffect(() => {
    if (audioRef.current && active) {
      audioRef.current.volume = muted ? 0 : TARGET_VOL;
    }
  }, [muted, active]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{
        duration: phase === "fading" ? FADE_OUT_MS / 1000 : 0.12,
        ease: "easeOut",
      }}
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
      data-no-sound
    >
      {phase === "bsod" ? (
        <BsodScreen />
      ) : (
        <RaveScreen winSrc={winSymbol?.src ?? undefined} />
      )}
    </motion.div>
  );
}
