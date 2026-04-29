import React from "react";
import { Link } from "wouter";
import { Ghost, Home, Gamepad2, Settings } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      {/* Subtle Grain Overlay */}
      <div className="fixed inset-0 bg-noise z-0 opacity-[0.03]"></div>

      {/* Slim Left Sidebar */}
      <aside className="w-16 hidden md:flex flex-col items-center py-8 border-r border-border/40 z-10 bg-background/50 backdrop-blur-sm">
        <Link href="/" className="mb-12 text-primary hover:text-primary/80 transition-colors">
          <Ghost size={24} strokeWidth={1.5} />
        </Link>
        
        <nav className="flex flex-col gap-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <Home size={20} strokeWidth={1.5} />
          </Link>
          <div className="text-muted-foreground/30 cursor-not-allowed">
            <Gamepad2 size={20} strokeWidth={1.5} />
          </div>
          <div className="text-muted-foreground/30 cursor-not-allowed">
            <Settings size={20} strokeWidth={1.5} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto px-6 py-12 md:py-24">
          {children}
        </div>
      </main>
    </div>
  );
}
