import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-noise z-0 opacity-[0.03] pointer-events-none"></div>

      <main className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto px-6 py-12 md:py-24">
          {children}
        </div>
      </main>
    </div>
  );
}
