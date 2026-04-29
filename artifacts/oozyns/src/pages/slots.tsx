import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import swirlUrl from "../assets/swirl.png";
import { sound } from "@/lib/sound";
import { WinExperience } from "@/components/win-experience";

// DEBUG: when true, every spin is forced to a win so you can test the
// jackpot animation without waiting for the 1-in-25 odds. Flip to false
// before shipping.
const DEBUG_ALWAYS_WIN = false;

type Symbol = { id: string; src: string };

const SYMBOLS: Symbol[] = [
  { id: "s1", src: "https://i.imgur.com/At5EvhS.png" },
  { id: "s2", src: "https://i.imgur.com/KuGij8t.png" },
  { id: "s3", src: "https://i.imgur.com/BLgerSI.png" },
  { id: "s4", src: "https://i.imgur.com/FhlxwGz.png" },
  { id: "s5", src: "https://i.imgur.com/Fz1ylKq.png" },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Slots() {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<Symbol[]>([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]]);
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const [lockedReels, setLockedReels] = useState<number[]>([]);

  const [spins, setSpins] = useState(0);
  const [wins, setWins] = useState(0);
  const [winState, setWinState] = useState<"none" | "win" | "near-miss">("none");
  const [showWin, setShowWin] = useState(false);
  const [winSymbol, setWinSymbol] = useState<Symbol | null>(null);

  const reelsRef = useRef(reels);
  reelsRef.current = reels;

  // Track whether the page is still mounted so queued reel ticks don't keep
  // firing sounds after the user navigates away mid-spin.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const runReel = async (index: number) => {
    setActiveReel(index);
    let lastRandomIndex = -1;

    const startTime = performance.now();
    const fastDuration = 1500 + index * 500;
    const slowDuration = 3000;
    const totalDuration = fastDuration + slowDuration;

    return new Promise<void>((resolve) => {
      const tick = (currentTime: number) => {
        if (!aliveRef.current) {
          resolve();
          return;
        }
        const elapsed = currentTime - startTime;

        if (elapsed < totalDuration) {
          let currentDelay;

          if (elapsed < fastDuration) {
            currentDelay = 60;
          } else {
            const slowProgress = (elapsed - fastDuration) / slowDuration;
            currentDelay = 60 + easeOutCubic(slowProgress) * 500;
          }

          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * SYMBOLS.length);
          } while (randomIndex === lastRandomIndex);

          lastRandomIndex = randomIndex;

          sound.tick();

          setReels((prev) => {
            const next = [...prev];
            next[index] = SYMBOLS[randomIndex];
            return next;
          });

          setTimeout(() => {
            requestAnimationFrame(tick);
          }, currentDelay);
        } else {
          setActiveReel(null);
          setLockedReels((prev) => [...prev, index]);
          sound.reelStop();
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  };

  const handleSpin = async () => {
    if (spinning) return;

    // Cancel any active win animation so a new spin resets cleanly.
    setShowWin(false);

    sound.spin();

    setSpinning(true);
    setLockedReels([]);
    setWinState("none");

    await runReel(0);
    await runReel(1);
    await runReel(2);

    if (!aliveRef.current) return;

    if (DEBUG_ALWAYS_WIN) {
      const winning = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      setReels([winning, winning, winning]);
      reelsRef.current = [winning, winning, winning];
    }

    const finalReels = reelsRef.current;

    const isWin =
      finalReels[0].id === finalReels[1].id && finalReels[1].id === finalReels[2].id;
    const isNearMiss =
      !isWin &&
      (finalReels[0].id === finalReels[1].id ||
        finalReels[1].id === finalReels[2].id ||
        finalReels[0].id === finalReels[2].id);

    setSpins((s) => s + 1);
    if (isWin) {
      setWins((w) => w + 1);
      setWinState("win");
      setWinSymbol(finalReels[0]);
      // Brief pause to let the reels settle visually before BSOD takes over
      setTimeout(() => {
        if (aliveRef.current) setShowWin(true);
      }, 250);
    } else if (isNearMiss) {
      setWinState("near-miss");
      setTimeout(() => {
        if (aliveRef.current) sound.nearMiss();
      }, 220);
    }

    setSpinning(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex items-center justify-between mb-16"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
        <div className="flex gap-6 text-sm font-mono tracking-widest text-muted-foreground">
          <div className="flex flex-col items-end">
            <span className="text-xs opacity-50 uppercase">Spins</span>
            <span className="text-foreground">{spins}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs opacity-50 uppercase">Wins</span>
            <span className={wins > 0 ? "text-primary" : "text-foreground"}>{wins}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full flex flex-col items-center"
      >
        <h2 className="font-display font-black uppercase italic text-4xl md:text-5xl mb-12 tracking-tight">
          Slot Machine
        </h2>

        <div className="relative">
          <div
            className={`absolute inset-0 blur-3xl transition-opacity duration-1000 ${
              winState === "win" ? "opacity-30 bg-primary" : "opacity-0"
            }`}
          ></div>

          <div className="flex flex-row gap-4 md:gap-6 mb-12 relative z-10 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xl">
            {reels.map((symbol, i) => {
              const isLocked = lockedReels.includes(i);
              const isActive = activeReel === i;

              return (
                <div
                  key={i}
                  className={`
                    w-28 h-28 md:w-40 md:h-40 rounded-xl flex items-center justify-center bg-background
                    border-2 transition-all duration-300 relative overflow-hidden
                    ${isActive ? "border-primary/50 shadow-[0_0_20px_rgba(217,119,87,0.25)]" : ""}
                    ${
                      isLocked
                        ? "border-primary shadow-[0_0_30px_rgba(217,119,87,0.45)]"
                        : "border-border"
                    }
                    ${!isActive && !isLocked ? "shadow-inner" : ""}
                  `}
                >
                  <div className="absolute inset-0 opacity-[0.03] bg-noise pointer-events-none"></div>

                  <motion.img
                    key={`${i}-${symbol.id}-${spinning ? "spin" : "stop"}`}
                    src={symbol.src}
                    alt=""
                    initial={
                      spinning && !isLocked ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }
                    }
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.08 }}
                    className={`w-20 h-20 md:w-28 md:h-28 object-contain ${
                      spinning && !isLocked ? "blur-[1px]" : ""
                    }`}
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-10 mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={winState + spins}
            className={`font-display font-extrabold uppercase italic text-lg md:text-xl tracking-[0.15em] ${
              winState === "win"
                ? "text-primary"
                : winState === "near-miss"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {winState === "win" && "GOLD GOLD GOLD GOLD"}
            {winState === "near-miss" && "ONE MORE GAME"}
            {winState === "none" && !spinning && spins === 0 && "TAKE A SPIN"}
            {winState === "none" && !spinning && spins > 0 && "ONE MORE GAME"}
            {spinning && "\u00A0"}
          </motion.p>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          data-no-sound
          className={`
            relative overflow-hidden px-20 py-6 rounded-full font-display font-black tracking-[0.25em] uppercase italic text-base
            transition-all duration-300 group
            ${
              spinning
                ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                : "bg-primary text-primary-foreground hover:shadow-[0_0_50px_-10px_rgba(217,119,87,0.7)] border-2 border-primary hover:-translate-y-0.5 active:translate-y-0"
            }
          `}
        >
          {!spinning && (
            <span
              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"
              style={{
                backgroundImage: `url(${swirlUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                mixBlendMode: "overlay",
              }}
            />
          )}
          <span className="relative z-10">{spinning ? "Spinning..." : "Spin"}</span>
        </button>
      </motion.div>

      <WinExperience
        active={showWin}
        winSymbol={winSymbol}
        onEnd={() => setShowWin(false)}
      />
    </div>
  );
}
