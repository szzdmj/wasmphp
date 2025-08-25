// V66a: Hardened against 1101, safer GitHub fetch, raw view for /public, and full try/catch guards.

import wasmAsset from "../scripts/php_8_4.wasm";

// Minimal globals to satisfy Emscripten glue in Workers
(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined" || typeof g.location?.href === "undefined") {
    try { Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true }); } catch {}
  }
  if (typeof g.self === "undefined") {
    try { Object.defineProperty(g, "self", { value: g, configurable: true }); } catch {}
  } else if (typeof g.self.location === "undefined" && typeof g.location !== "undefined") {
    try { g.self.location = g.location; } catch {}
  }
})();

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

function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}

function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try { successCallback(instance); } catch {}
    return instance.exports as any;
  };
}

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

type RunResult = {
  ok: boolean;
  stdout: string[];
  stderr: string[];
  debug: string[];
  exitStatus?: number;
  php?: any;
  error?: string;
};

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

async function buildModuleOptions(argv: string[]) {
  const opts: any = {
    noInitialRun: false,
    arguments: argv.slice(),
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    quit: (status: number, toThrow?: any) => {
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
  };

  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }

  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm from URL: ${res.status}`);
    const buf = await res.arrayBuffer();
    opts.wasmBinary = new Uint8Array(buf);
    return opts;
  }

  if (wasmAsset instanceof ArrayBuffer) {
    opts.wasmBinary = new Uint8Array(wasmAsset);
    return opts;
  }

  if (ArrayBuffer.isView(wasmAsset)) {
    const view = wasmAsset as ArrayBufferView;
    opts.wasmBinary = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    return opts;
  }

  throw new Error("Unsupported wasm asset type at runtime");
}

async function createPhpModuleAndRun(argv: string[], waitMs = 8000): Promise<RunResult> {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitStatus: number | undefined;

  try {
    debug.push("step:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate = (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return { ok: false, stdout, stderr, debug,
        error: "PHP init function not found on module export. Ensure -s MODULARIZE=1 -s EXPORT_ES6=1. Exports: " + Object.keys(phpModule || {}).join(", "),
      };
    }

    debug.push("step:build-options");
    const moduleOptions: any = await buildModuleOptions(argv);
    moduleOptions.print = (txt: string) => { try { stdout.push(String(txt)); } catch {} };
    moduleOptions.printErr = (txt: string) => { try { stderr.push(String(txt)); } catch {} };
    moduleOptions.onRuntimeInitialized = () => { debug.push("event:onRuntimeInitialized"); };

    debug.push("step:init-factory");
    let php: any;
    try {
      php = await (initCandidate as any)(moduleOptions);
    } catch (e1: any) {
      try {
        php = await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("factory:retry-with-WORKER:ok");
      } catch (e2: any) {
        return { ok: false, stdout, stderr, debug,
          error: "PHP factory invocation failed.\nFirst error: " + (e1?.stack || e1) + "\nRetry error: " + (e2?.stack || e2),
        };
      }
    }

    debug.push("step:await-output");
    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof (php as any).calledRun !== "undefined") {
        debug.push("probe:calledRun=" + String((php as any).calledRun));
      }
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        debug.push("exit:" + String(exitStatus));
        break;
      }
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 50));
    }

    return { ok: true, stdout, stderr, debug, php, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["catch-top", e?.message || String(e)], error: e?.stack || String(e) };
  }
}

function filterKnownNoise(lines: string[], keepAll: boolean) {
  if (keepAll) return { kept: lines.slice(), ignored: 0 };
  const patterns: RegExp[] = [/^munmap\(\)\s+failed:\s+\[\d+\]\s+Invalid argument/i];
  let ignored = 0;
  const kept = lines.filter((l) => {
    const t = String(l || "").trim();
    if (!t) return false;
    for (const re of patterns) {
      if (re.test(t)) { ignored++; return false; }
    }
    return true;
  });
  return { kept, ignored };
}

function inferContentTypeFromOutput(stdout: string, fallback = "text/plain; charset=utf-8") {
  if (stdout.includes("<html") || stdout.includes("<!DOCTYPE html")) return "text/html; charset=utf-8";
  return fallback;
}

// ——— GitHub Raw helpers ———
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

async function fetchGithubPhpSource(owner: string, repo: string, path: string, ref?: string): Promise<{ ok: boolean; code?: string; err?: string; status?: number }> {
  try {
    const branch = (ref && ref.trim()) || "main";
    const u = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.replace(/^\/+/, "")}`;
    const headers: Record<string, string> = {
      "cache-control": "no-cache",
      "user-agent": "wasmphp-worker",
      "accept": "text/plain, */*",
    };
    let res = await fetch(u, { method: "GET", headers });
    if (res.ok) {
      const txt = await res.text();
      return { ok: true, code: normalizePhpCodeForEval(txt), status: res.status };
    }
    // fallback: master
    if (branch !== "master") {
      const u2 = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path.replace(/^\/+/, "")}`;
      res = await fetch(u2, { method: "GET", headers });
      if (res.ok) {
        const txt2 = await res.text();
        return { ok: true, code: normalizePhpCodeForEval(txt2), status: res.status };
      }
    }
    return { ok: false, err: `Raw fetch failed: ${owner}/${repo}:${branch}/${path} (${res.status})`, status: res.status };
  } catch (e: any) {
    return { ok: false, err: "Raw fetch threw: " + (e?.message || String(e)) };
  }
}

// ——— Routes ———
async function routeInfo(url: URL): Promise<Response> {
  try {
    const argv = buildArgvForCode("phpinfo();");
    const res = await createPhpModuleAndRun(argv);
    const debugMode = url.searchParams.get("debug") === "1" || url.searchParams.get("showstderr") === "1";
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    const stdout = res.stdout.join("\n");
    const { kept: errKept } = filterKnownNoise(res.stderr, debugMode);
    const err = errKept.join("\n");
    const ct = inferContentTypeFromOutput(stdout, "text/html; charset=utf-8");
    const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
    const body = (stdout || err || "") + trace;
    const status = stdout ? 200 : err ? 500 : typeof res.exitStatus === "number" ? (res.exitStatus === 0 ? 204 : 500) : 204;
    return new Response(body, { status, headers: { "content-type": ct } });
  } catch (e: any) {
    return textResponse("routeInfo error: " + (e?.stack || String(e)), 500);
  }
}

async function routeRunGET(url: URL): Promise<Response> {
  try {
    const codeRaw = url.searchParams.get("
