// src/index.ts
// wasmphp worker - minimal, Hono-free
// Fully self-contained, avoids 1101 by using original wasm/js glue import

import wasmAsset from "../scripts/php_8_4.wasm"; // must match your project file
import initWasm from "../scripts/php_8_4.js";     // Emscripten glue JS

// --- Types ---
type Env = {
  SRC?: KVNamespace;
  ADMIN_TOKEN?: string;
};

// --- Defaults ---
const DEFAULT_INIS = [
  "pcre.jit=0",
  "opcache.enable=0",
  "opcache.enable_cli=0",
  "opcache.jit=0",
  "opcache.jit_buffer_size=0",
  "opcache.file_cache=",
  "output_buffering=0",
  "implicit_flush=1",
  "zlib.output_compression=0",
  "display_errors=1",
  "display_startup_errors=1",
];

// --- helpers ---
function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

function parseIniParams(url: URL): string[] {
  const out: string[] = [];
  const ds = url.searchParams.getAll("d").concat(url.searchParams.getAll("ini"));
  for (const s of ds) {
    const t = s.trim();
    if (t && t.includes("=")) out.push(t);
  }
  return out;
}

function buildArgvForCode(code: string, iniList: string[] = []): string[] {
  const argv: string[] = [];
  for (const d of DEFAULT_INIS) argv.push("-d", d);
  for (const d of iniList) if (d) argv.push("-d", d);
  argv.push("-r", code);
  return argv;
}

function wrapCodeWithShutdownNewline(code: string): string {
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}

// --- normalize PHP ---
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

// --- run PHP ---
async function runPhp(argv: string[], waitMs = 8000) {
  const stdout: string[] = [];
  const stderr: string[] = [];

  const moduleOptions: any = {
    arguments: argv,
    print: (txt: string) => stdout.push(String(txt)),
    printErr: (txt: string) => stderr.push(String(txt)),
    noInitialRun: true,
    wasmBinary: wasmAsset,
    onRuntimeInitialized: () => {
      try { (moduleOptions as any).callMain(argv); } catch(e) {}
    },
  };

  let exitStatus: number | undefined;

  try {
    await initWasm(moduleOptions);

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        break;
      }
      await new Promise((r) => setTimeout(r, 20));
    }

    return { ok: true, stdout, stderr, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, error: e?.message || String(e) };
  }
}

// --- KV / GitHub fetch ---
async function fetchKVPhpSource(env: Env, key: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  try {
    if (!env?.SRC || typeof env.SRC.get !== "function") return { ok: false, err: "KV SRC not configured" };
    const txt = await env.SRC.get(key, "text");
    if (txt == null) return { ok: false, err: `KV object not found: ${key}` };
    return { ok: true, code: normalizePhpCodeForEval(txt) };
  } catch (e: any) {
    return { ok: false, err: e?.message || String(e) };
  }
}

async function fetchGithubPhpSource(owner: string, repo: string, path: string, ref?: string) {
  const branch = ref?.trim() || "main";
  const u = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.replace(/^\/+/, "")}`;
  const res = await fetch(u, { headers: { "cache-control": "no-cache", "user-agent": "wasmphp-worker" } });
  if (!res.ok) return { ok: false, err: `Failed fetch ${owner}/${repo}/${branch}/${path} (${res.status})` };
  const txt = await res.text();
  return { ok: true, code: normalizePhpCodeForEval(txt) };
}

// --- routes ---
async function routeIndex(url: URL, env: Env) {
  const key = "public/index.php";
  let codeNormalized: string | undefined;

  if (env?.SRC) {
    const kv = await fetchKVPhpSource(env, key);
    if (kv.ok) codeNormalized = kv.code;
  }

  if (!codeNormalized) {
    const gh = await fetchGithubPhpSource("szzdmj", "wasmphp", key);
    if (!gh.ok) return textResponse(gh.err || "Fetch error", 502);
    codeNormalized = gh.code;
  }

  const argv = buildArgvForCode(wrapCodeWithShutdownNewline(codeNormalized || ""), parseIniParams(url));
  const res = await runPhp(argv, 10000);
  return new Response(res.stdout.join(""), { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function routeRunGET(url: URL) {
  const codeRaw = url.searchParams.get("code") ?? "";
  if (!codeRaw) return textResponse("Bad Request: missing code", 400);
  const argv = buildArgvForCode(wrapCodeWithShutdownNewline(codeRaw), parseIniParams(url));
  const res = await runPhp(argv);
  return new Response(res.stdout.join(""), { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
}

// --- main fetch ---
export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") return textResponse("ok");
    if (pathname === "/run" && request.method === "GET") return routeRunGET(url);
    if (pathname === "/" || pathname === "/index.php") return routeIndex(url, env);

    return textResponse("Not Found", 404);
  },
};
