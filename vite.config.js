import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: aquest valor ha de coincidir EXACTAMENT amb el nom del teu
// repositori de GitHub. Ja està ajustat per al repositori "tutoria".
export default defineConfig({
  plugins: [react()],
  base: "/tutoria/",
});
