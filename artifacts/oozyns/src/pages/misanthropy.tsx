import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Shuffle, Copy, Check } from "lucide-react";
import { ProceduralArt } from "@/lib/proceduralArt";
import { sound } from "@/lib/sound";
import musicUrl from "@assets/Keaukaha_1777496202294.mp3";

type SymMode = "none" | "x" | "y" | "both";

const RES_OPTIONS = [50, 80, 100, 150, 200, 300, 400];
const FPS_OPTIONS = [15, 30, 60];
const DISPLAY_SIZE = 480;

function randomSeed() {
  return Math.floor(Math.random() * 9999900 + 100000);
}

export function Misanthropy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const artRef = useRef<ProceduralArt | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const [resolution, setResolution] = useState(100);
  const [pixelated, setPixelated] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [glow, setGlow] = useState(true);
  const [mono, setMono] = useState(false);
  const [invert, setInvert] = useState(false);
  const [strobe, setStrobe] = useState(false);
  const [kaleido, setKaleido] = useState(false);
  const [symmetry, setSymmetry] = useState<SymMode>("none");
  const [speed, setSpeed] = useState(1);
  const [duration, setDuration] = useState(6);
  const [fps, setFps] = useState(30);
  const [currentSeed, setCurrentSeed] = useState<number>(randomSeed());
  const [seedInput, setSeedInput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Load + auto-start the background music (with autoplay-policy fallback)
  useEffect(() => {
    sound.setMusic(musicUrl, 0.32);
    let armed = true;
    void sound.startMusic(2000);

    const tryStart = () => {
      if (!armed) return;
      void sound.startMusic(1500);
      if (sound.isMusicPlaying()) {
        armed = false;
        window.removeEventListener("pointerdown", tryStart);
        window.removeEventListener("keydown", tryStart);
      }
    };
    window.addEventListener("pointerdown", tryStart);
    window.addEventListener("keydown", tryStart);

    return () => {
      armed = false;
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
      sound.stopMusic(600);
    };
  }, []);

  // (Re)build the art instance whenever resolution or seed changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const art = new ProceduralArt({
      width: resolution,
      height: resolution,
      seed: currentSeed,
      autoMode,
      duration,
      blendTime: 0.6,
      speedMult: speed,
      glowEnabled: glow,
      monoEnabled: mono,
      invertColors: invert,
      strobeEnabled: strobe,
      symmetryMode: symmetry,
      kaleidoEnabled: kaleido,
    });
    artRef.current = art;

    const imageData = ctx.createImageData(resolution, resolution);
    lastFrameTimeRef.current = 0;
    lastTickRef.current = 0;

    const loop = (now: number) => {
      const dt = lastFrameTimeRef.current
        ? Math.min(0.1, (now - lastFrameTimeRef.current) / 1000)
        : 0.016;
      lastFrameTimeRef.current = now;

      const tickInterval = 1000 / fps;
      if (now - lastTickRef.current >= tickInterval) {
        lastTickRef.current = now;
        const seedNow = art.render(imageData, dt);
        ctx.putImageData(imageData, 0, 0);
        if (seedNow !== currentSeed) {
          setCurrentSeed(seedNow);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // Intentionally re-create when resolution/seed changes; other props synced below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolution, currentSeed]);

  // Sync mutable props to the existing instance without rebuilding
  useEffect(() => {
    const art = artRef.current;
    if (!art) return;
    art.autoMode = autoMode;
    art.glowEnabled = glow;
    art.monoEnabled = mono;
    art.invertColors = invert;
    art.strobeEnabled = strobe;
    art.kaleidoEnabled = kaleido;
    art.symmetryMode = symmetry;
    art.speedMult = speed;
    art.duration = duration;
  }, [autoMode, glow, mono, invert, strobe, kaleido, symmetry, speed, duration]);

  const reseed = () => {
    if (!artRef.current) return;
    artRef.current.startTransition();
  };

  const jumpToSeed = (seed: number) => {
    if (!Number.isFinite(seed)) return;
    setCurrentSeed(Math.floor(seed));
  };

  const applyManualSeed = () => {
    const n = parseInt(seedInput, 10);
    if (Number.isFinite(n) && n > 0) {
      // Play click for the keyboard-Enter path (the global handler covers the button click)
      sound.click();
      jumpToSeed(n);
      setSeedInput("");
    }
  };

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(String(currentSeed));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
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

  const Slider = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
    suffix,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
    suffix?: string;
  }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-xs text-foreground">
          {value.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center min-h-[80vh]">
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
        className="font-display font-black uppercase italic text-4xl md:text-6xl mb-3 tracking-tight"
      >
        Misanthropy
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="font-sans text-sm md:text-base text-muted-foreground mb-10 max-w-md text-center"
      >
        An effect made in Roblox, ported to whatever language this is.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50"></div>
        <div className="relative bg-card border border-border rounded-2xl p-3 md:p-4 shadow-2xl">
          <canvas
            ref={canvasRef}
            className="block rounded-xl bg-black"
            style={{
              width: `${DISPLAY_SIZE}px`,
              height: `${DISPLAY_SIZE}px`,
              maxWidth: "min(80vw, 480px)",
              maxHeight: "min(80vw, 480px)",
              imageRendering: pixelated ? "pixelated" : "auto",
            }}
          />
        </div>
      </motion.div>

      {/* Seed bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl mb-8 flex flex-col sm:flex-row items-stretch gap-2"
      >
        <div className="flex-1 flex items-center gap-3 bg-card border border-border rounded-md px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Seed
          </span>
          <span className="font-mono text-base text-foreground flex-1 truncate">
            {currentSeed}
          </span>
          <button
            onClick={copySeed}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy seed"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyManualSeed();
          }}
          placeholder="Enter seed..."
          className="bg-card border border-border rounded-md px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 sm:w-44"
        />
        <button
          onClick={applyManualSeed}
          className="px-5 py-3 rounded-md font-display font-extrabold uppercase italic text-xs tracking-[0.2em] border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all"
        >
          Jump
        </button>
        <button
          onClick={reseed}
          className="px-5 py-3 rounded-md font-display font-extrabold uppercase italic text-xs tracking-[0.2em] border-2 border-primary bg-primary text-primary-foreground hover:shadow-[0_0_30px_-5px_rgba(217,119,87,0.6)] transition-all flex items-center gap-2"
        >
          <Shuffle size={14} />
          New
        </button>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-3xl flex flex-col gap-8"
      >
        {/* Effect toggles */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Effects
          </span>
          <div className="flex flex-wrap gap-2">
            <Toggle label="Auto" active={autoMode} onClick={() => setAutoMode((v) => !v)} />
            <Toggle label="Glow" active={glow} onClick={() => setGlow((v) => !v)} />
            <Toggle label="Mono" active={mono} onClick={() => setMono((v) => !v)} />
            <Toggle label="Invert" active={invert} onClick={() => setInvert((v) => !v)} />
            <Toggle label="Strobe" active={strobe} onClick={() => setStrobe((v) => !v)} />
            <Toggle label="Kaleido" active={kaleido} onClick={() => setKaleido((v) => !v)} />
          </div>
        </div>

        {/* Symmetry */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Symmetry
          </span>
          <div className="flex flex-wrap gap-2">
            {(["none", "x", "y", "both"] as SymMode[]).map((m) => (
              <Toggle
                key={m}
                label={m}
                active={symmetry === m}
                onClick={() => setSymmetry(m)}
              />
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Resolution
          </span>
          <div className="flex flex-wrap gap-2">
            {RES_OPTIONS.map((r) => (
              <Toggle
                key={r}
                label={`${r}\u00D7${r}`}
                active={resolution === r}
                onClick={() => setResolution(r)}
              />
            ))}
            <Toggle
              label={pixelated ? "Pixelated: ON" : "Pixelated: OFF"}
              active={pixelated}
              onClick={() => setPixelated((v) => !v)}
            />
          </div>
        </div>

        {/* Frame rate */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Frame Rate
          </span>
          <div className="flex flex-wrap gap-2">
            {FPS_OPTIONS.map((f) => (
              <Toggle
                key={f}
                label={`${f} FPS`}
                active={fps === f}
                onClick={() => setFps(f)}
              />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border rounded-xl p-5">
          <Slider
            label="Speed"
            value={speed}
            min={0.1}
            max={4}
            step={0.05}
            onChange={setSpeed}
            suffix="x"
          />
          <Slider
            label="Scene Duration"
            value={duration}
            min={1}
            max={20}
            step={0.5}
            onChange={setDuration}
            suffix="s"
          />
        </div>
      </motion.div>
    </div>
  );
}
