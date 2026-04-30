# Byte - AI Chat Desktop Application

## Project Type
Tauri 2.x desktop app with React 19 + TypeScript frontend and Rust backend.

## Commands
- `npm run dev` - Start Vite dev server (runs at http://localhost:5173)
- `npm run build` - TypeScript check + Vite build
- `npm run preview` - Preview production build
- `npx tauri dev` - Run full Tauri app in dev mode
- `npx tauri build` - Build desktop app (outputs to src-tauri/target/release)

## Directory Structure
- `src/` - React frontend (entry: `src/main.tsx`, `src/App.tsx`)
- `src-tauri/` - Rust backend (entry: `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`)
- `prompts/` - AI prompt templates (not app code)

## Tech Stack
- Frontend: React 19, TypeScript ~5.7, Vite 6, Zustand 5
- Desktop: Tauri 2.10, Rust 1.77.2+
- UI: lucide-react icons, react-markdown, highlight.js, katex

## Important Configs
- `tsconfig.json` - Strict mode enabled, no unused locals/params allowed
- `src-tauri/tauri.conf.json` - App config (window size 800x600, updater enabled)
- `src-tauri/Cargo.toml` - Rust dependencies

## State Management
- Uses Zustand (`src/store/useStore.ts`) for global state
- No Redux or other state libraries

## Build Requirements
- Rust toolchain 1.77.2+
- Node.js (check node_modules for version)
- `npm install` required before first build
