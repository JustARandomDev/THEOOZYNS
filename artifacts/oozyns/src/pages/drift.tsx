import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Shuffle } from "lucide-react";
import { ProceduralArt } from "@/lib/proceduralArt";

const RES = 180;

type SymMode = "none" | "x" | "y" | "both";

export function Drift() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artRef = useRef<ProceduralArt | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const [autoMode, setAutoMode] = useState(true);
  const [glow, setGlow] = useState(true);
  const [mono, setMono] = useState(false);
  const [invert, setInvert] = useState(false);
  const [strobe, setStrobe] = useState(false);
  const [kaleido, setKaleido] = useState(false);
  const [symmetry, setSymmetry] = useState<SymMode>("none");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = RES;
    canvas.height = RES;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const art = new ProceduralArt({
      width: RES,
      height: RES,
      autoMode: true,
      duration: 7,
      blendTime: 0.9,
      glowEnabled: true,
    });
    artRef.current = art;

    const imageData = ctx.createImageData(RES, RES);

    const loop = (now: number) => {
      const dt = lastTimeRef.current
        ? Math.min(0.1, (now - lastTimeRef.current) / 1000)
        : 0.016;
      lastTimeRef.current = now;
      art.render(imageData, dt);
      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!artRef.current) return;
    artRef.current.autoMode = autoMode;
    artRef.current.glowEnabled = glow;
    artRef.current.monoEnabled = mono;
    artRef.current.invertColors = invert;
    artRef.current.strobeEnabled = strobe;
    artRef.current.kaleidoEnabled = kaleido;
    artRef.current.symmetryMode = symmetry;
  }, [autoMode, glow, mono, invert, strobe, kaleido, symmetry]);

  const shuffle = () => {
    if (artRef.current) artRef.current.startTransition();
  };

  const Toggle = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-display font-extrabold uppercase italic text-xs tracking-[0.2em] border transition-all ${
        active
          ? "bg-primary text-primary-foreground border-primary shadow-[0_0_20px_-5px_rgba(217,119,87,0.5)]"
          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full flex items-center justify-between mb-12"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu</span>
        </Link>
        <div className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
          Procedural Genome
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display font-black uppercase italic text-4xl md:text-5xl mb-10 tracking-tight"
      >
        Drift
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-10"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50"></div>
        <div className="relative bg-card border border-border rounded-2xl p-3 md:p-4 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-xl"
            style={{ imageRendering: "auto" }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-2xl flex flex-col gap-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Toggle label="Auto" active={autoMode} onClick={() => setAutoMode((v) => !v)} />
          <Toggle label="Glow" active={glow} onClick={() => setGlow((v) => !v)} />
          <Toggle label="Mono" active={mono} onClick={() => setMono((v) => !v)} />
          <Toggle label="Invert" active={invert} onClick={() => setInvert((v) => !v)} />
          <Toggle label="Strobe" active={strobe} onClick={() => setStrobe((v) => !v)} />
          <Toggle label="Kaleido" active={kaleido} onClick={() => setKaleido((v) => !v)} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2">
            Symmetry
          </span>
          {(["none", "x", "y", "both"] as SymMode[]).map((m) => (
            <Toggle
              key={m}
              label={m}
              active={symmetry === m}
              onClick={() => setSymmetry(m)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={shuffle}
            className="relative overflow-hidden flex items-center gap-3 px-10 py-4 rounded-full font-display font-black tracking-[0.25em] uppercase italic text-sm bg-primary text-primary-foreground hover:shadow-[0_0_50px_-10px_rgba(217,119,87,0.7)] border-2 border-primary hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <Shuffle size={16} />
            <span>New Genome</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
