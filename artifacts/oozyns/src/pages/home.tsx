import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Lock, Sparkles, Hexagon, Component, Layers, Zap } from "lucide-react";

const comingSoonGames = [
  { id: "cipher", title: "Cipher Lock", icon: Hexagon },
  { id: "static", title: "Static Drift", icon: Zap },
  { id: "loom", title: "Loom", icon: Layers },
  { id: "echo", title: "Echo Chamber", icon: Component },
  { id: "void", title: "The Void", icon: Lock },
];

export function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center mb-24"
      >
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-foreground flex items-start gap-1">
          OOZYNS
          <span className="text-primary text-2xl md:text-4xl font-sans mt-2 md:mt-3">*</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-md text-sm md:text-base tracking-wide font-light">
          A quiet corner for short distractions.
        </p>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Game Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/slots" className="block group">
            <div className="w-full aspect-[4/3] rounded-xl bg-card border border-border/50 overflow-hidden relative transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_-5px_rgba(217,119,87,0.15)] group-hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-card to-background/50 z-0"></div>
              
              {/* Card Art */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border border-primary/20 rounded-lg rotate-12 transition-transform duration-700 group-hover:rotate-45 group-hover:border-primary/40"></div>
                  <div className="absolute inset-0 border border-primary/20 rounded-lg -rotate-12 transition-transform duration-700 group-hover:-rotate-45 group-hover:border-primary/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center bg-background rounded-lg border border-border shadow-xl">
                    <Sparkles className="w-10 h-10 text-primary transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6 z-20 bg-gradient-to-t from-card to-transparent">
                <h3 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">Slot Machine</h3>
                <p className="text-sm text-muted-foreground mt-1 font-light">High tension, low stakes.</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Coming Soon Cards */}
        {comingSoonGames.map((game, index) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 + (index * 0.1), ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full aspect-[4/3] rounded-xl bg-card/40 border border-border/30 overflow-hidden relative cursor-not-allowed group">
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-30 group-hover:opacity-40 transition-opacity">
                  <Icon className="w-12 h-12 text-muted-foreground" strokeWidth={1} />
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Lock className="w-5 h-5 text-muted-foreground mb-2" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Locked</span>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                  <h3 className="font-serif text-xl text-muted-foreground">{game.title}</h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
