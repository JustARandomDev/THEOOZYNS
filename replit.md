# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **OOZYNS** (`artifacts/oozyns`) — dark, warm-toned games/effects portal at `/`. Frontend-only React + Vite app using wouter for routing. Main menu (`/`) lists experience cards. Current experiences: Slot Machine (`/slots`), Drift (`/drift`) — a procedural art genome ported from a Roblox Lua module to TypeScript (`src/lib/proceduralArt.ts`), rendered to a canvas via per-pixel ImageData. Visual identity: deep warm dark backgrounds with a subtle tiled swirl pattern and coral/burnt-orange accent; bold italic Montserrat for display type, Inter for UI. Uses framer-motion for animations.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
