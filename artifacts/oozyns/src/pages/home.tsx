import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import swirlUrl from "../assets/swirl.png";

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

      <div className="w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <Link href="/slots" className="block group">
            <div className="w-full aspect-[4/3] rounded-2xl bg-card border border-border/60 overflow-hidden relative transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-[0_0_50px_-10px_rgba(217,119,87,0.35)] group-hover:-translate-y-1">
              {/* Swirl pattern overlay */}
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

              <div className="absolute inset-0 flex items-center justify-center z-10">
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
      </div>
    </div>
  );
}
