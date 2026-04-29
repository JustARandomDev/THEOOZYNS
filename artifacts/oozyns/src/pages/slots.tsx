import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Diamond, Crown, Star, Moon, Heart, Flame } from "lucide-react";

// Symbols for the slots
const SYMBOLS = [
  { id: 'diamond', component: Diamond, color: 'text-[#e2e8f0]' },
  { id: 'crown', component: Crown, color: 'text-[#fbbf24]' },
  { id: 'star', component: Star, color: 'text-[#fef08a]' },
  { id: 'moon', component: Moon, color: 'text-[#94a3b8]' },
  { id: 'heart', component: Heart, color: 'text-[#fca5a5]' },
  { id: 'flame', component: Flame, color: 'text-primary' },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Slots() {
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([
    SYMBOLS[0],
    SYMBOLS[1],
    SYMBOLS[2]
  ]);
  const [activeReel, setActiveReel] = useState<number | null>(null);
  const [lockedReels, setLockedReels] = useState<number[]>([]);
  
  const [spins, setSpins] = useState(0);
  const [wins, setWins] = useState(0);
  const [winState, setWinState] = useState<'none' | 'win' | 'near-miss'>('none');

  const reelsRef = useRef(reels);
  reelsRef.current = reels;

  const runReel = async (index: number) => {
    setActiveReel(index);
    let lastRandomIndex = -1;
    
    const startTime = performance.now();
    const fastDuration = 1500 + (index * 500); // Stagger duration per reel
    const slowDuration = 3000;
    const totalDuration = fastDuration + slowDuration;

    return new Promise<void>(resolve => {
      const tick = (currentTime: number) => {
        const elapsed = currentTime - startTime;

        if (elapsed < totalDuration) {
          let currentDelay;

          if (elapsed < fastDuration) {
            currentDelay = 60;
          } else {
            const slowProgress = (elapsed - fastDuration) / slowDuration;
            currentDelay = 60 + (easeOutCubic(slowProgress) * 500);
          }

          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * SYMBOLS.length);
          } while (randomIndex === lastRandomIndex);
          
          lastRandomIndex = randomIndex;
          
          setReels(prev => {
            const next = [...prev];
            next[index] = SYMBOLS[randomIndex];
            return next;
          });

          setTimeout(() => {
            requestAnimationFrame(tick);
          }, currentDelay);
        } else {
          setActiveReel(null);
          setLockedReels(prev => [...prev, index]);
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  };

  const handleSpin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setLockedReels([]);
    setWinState('none');
    
    // Start all reels, await them sequentially or parallel but with staggered stop times
    // The reference says "1 stops, then 2, then 3"
    
    await runReel(0);
    await runReel(1);
    await runReel(2);

    const finalReels = reelsRef.current;
    
    // Check results
    const isWin = finalReels[0].id === finalReels[1].id && finalReels[1].id === finalReels[2].id;
    const isNearMiss = !isWin && (
      finalReels[0].id === finalReels[1].id ||
      finalReels[1].id === finalReels[2].id ||
      finalReels[0].id === finalReels[2].id
    );

    setSpins(s => s + 1);
    if (isWin) {
      setWins(w => w + 1);
      setWinState('win');
    } else if (isNearMiss) {
      setWinState('near-miss');
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
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-light text-sm">
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
        <h2 className="font-serif text-4xl font-light mb-16 tracking-wide">Slot Machine</h2>

        {/* The Machine */}
        <div className="relative">
          {/* Subtle glow behind machine when win */}
          <div className={`absolute inset-0 blur-3xl transition-opacity duration-1000 ${winState === 'win' ? 'opacity-20 bg-primary' : 'opacity-0'}`}></div>
          
          <div className="flex flex-row gap-4 md:gap-8 mb-16 relative z-10 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xl">
            {reels.map((symbol, i) => {
              const isLocked = lockedReels.includes(i);
              const isActive = activeReel === i;
              const SymbolIcon = symbol.component;
              
              return (
                <div 
                  key={i}
                  className={`
                    w-24 h-32 md:w-32 md:h-40 rounded-xl flex items-center justify-center bg-background
                    border-2 transition-all duration-300 relative overflow-hidden
                    ${isActive ? 'border-primary/50 shadow-[0_0_20px_rgba(217,119,87,0.2)]' : ''}
                    ${isLocked ? 'border-primary shadow-[0_0_30px_rgba(217,119,87,0.4)]' : 'border-border'}
                    ${!isActive && !isLocked ? 'shadow-inner' : ''}
                  `}
                >
                  {/* Subtle inner noise for reels */}
                  <div className="absolute inset-0 opacity-[0.02] bg-noise pointer-events-none"></div>
                  
                  <motion.div
                    key={`${i}-${symbol.id}-${spinning ? 'spin' : 'stop'}`}
                    initial={spinning && !isLocked ? { y: -50, opacity: 0 } : { y: 0, opacity: 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    <SymbolIcon className={`w-12 h-12 md:w-16 md:h-16 ${symbol.color} ${spinning && !isLocked ? 'blur-[1px]' : ''}`} strokeWidth={1.5} />
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Text */}
        <div className="h-8 mb-8">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={winState}
            className={`font-serif text-lg italic ${winState === 'win' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {winState === 'win' && "A perfect alignment."}
            {winState === 'near-miss' && "Close, but not quite."}
            {winState === 'none' && !spinning && spins === 0 && "Take a spin."}
            {winState === 'none' && !spinning && spins > 0 && "Again."}
          </motion.p>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`
            relative overflow-hidden px-16 py-5 rounded-full font-sans tracking-[0.2em] uppercase text-sm font-semibold
            transition-all duration-300
            ${spinning 
              ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_40px_-10px_rgba(217,119,87,0.5)] border border-primary-border hover:-translate-y-0.5 active:translate-y-0'
            }
          `}
        >
          {spinning ? 'Spinning...' : 'Spin'}
        </button>
      </motion.div>
    </div>
  );
}
