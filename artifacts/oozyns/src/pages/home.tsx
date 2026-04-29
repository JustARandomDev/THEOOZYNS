import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import swirlUrl from "../assets/swirl.png";
import { ProceduralArt } from "@/lib/proceduralArt";

function DriftPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const RES = 96;
    canvas.width = RES;
    canvas.height = RES;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const art = new ProceduralArt({
      width: RES,
      height: RES,
      autoMode: true,
      duration: 5,
      blendTime: 0.8,
      glowEnabled: true,
      kaleidoEnabled: true,
    });
    const imageData = ctx.createImageData(RES, RES);
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
      last = now;
      art.render(imageData, dt);
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-40 h-40 md:w-48 md:h-48 rounded-xl"
      style={{ imageRendering: "auto" }}
    />
  );
}

export function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center mb-20"
      >
        <h1
          className="font-display text-6xl md:text-8xl font-black tracking-tight text-foreground flex items-start gap-2 uppercase italic"
          style={{ letterSpacing: "-0.04em" }}
        >
          OOZYNS
          <span className="text-primary text-3xl md:text-5xl mt-2 md:mt-3 not-italic">*</span>
        </h1>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Slot Machine card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/slots" className="block group">
            <div className="w-full aspect-[4/3] rounded-2xl bg-card border border-border/60 overflow-hidden relative transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-[0_0_50px_-10px_rgba(217,119,87,0.35)] group-hover:-translate-y-1">
              <div
                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{
                  backgroundImage: `url(${swirlUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  mixBlendMode: "luminosity",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/90 z-0"></div>

              {/* 777 — sit in the upper portion so it's optically centered above the title overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10 pb-24">
                <div className="font-display font-black text-primary text-7xl md:text-8xl italic tracking-tighter drop-shadow-[0_4px_20px_rgba(217,119,87,0.5)]">
                  777
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-card via-card/90 to-transparent">
                <h3 className="font-display font-black uppercase italic text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors tracking-tight">
                  Slot Machine
                </h3>
                <p className="font-display font-extrabold uppercase italic text-sm md:text-base text-primary/80 mt-1 tracking-[0.15em]">
                  GOLD GOLD GOLD GOLD
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Drift card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/drift" className="block group">
            <div className="w-full aspect-[4/3] rounded-2xl bg-card border border-border/60 overflow-hidden relative transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-[0_0_50px_-10px_rgba(217,119,87,0.35)] group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/40 to-background/95 z-10 pointer-events-none"></div>

              <div className="absolute inset-0 flex items-center justify-center z-0 pb-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-2xl"></div>
                  <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                    <DriftPreview />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-card via-card/95 to-transparent">
                <h3 className="font-display font-black uppercase italic text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors tracking-tight">
                  Drift
                </h3>
                <p className="font-display font-extrabold uppercase italic text-sm md:text-base text-primary/80 mt-1 tracking-[0.15em]">
                  GENOME OF MOVING COLOR
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
