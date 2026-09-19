import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    // Alias-ul "@/*" e definit si in tsconfig.json (pentru verificarea de
    // tipuri) — Vite NU citeste tsconfig.json pentru asta, are nevoie de
    // propria configurare ca sa rezolve importurile la runtime. Fara asta,
    // tsc trece curat dar aplicatia nu porneste deloc in browser (eroarea
    // gasita 2026-09-19: "Failed to resolve import @/... ").
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
