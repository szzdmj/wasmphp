// src/index.ts
// wasmphp worker - KV first, GitHub fallback, static files, auto-run (eval) mode

import wasmAsset from "../scripts/php_8_4.wasm"; // must match your project file
// glue loader dynamically imported inside runAuto

type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

const STATIC_EXT = /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|json|txt|woff2?|ttf|map|html?)$/i;

// -----------------------
// Minimal globals for Emscripten
(function ensureGlobals() {
  const g = globalThis as any;
  if (!g.location?.href) Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true });
  if (!g.self) Object.defineProperty(g, "self", { value: g, configurable: true });
  else if (!g.self.location && g.location) g.self.location = g.location;
})();

// -----------------------
// helpers (ini, argv, base64, mime)
const DEFAULT_INIS = [
  "pcre.jit=0", "opcache.enable=0", "opcache.enable_cli=0",
 
