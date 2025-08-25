// V66c: fix 204-with-body error by avoiding 204/205/304 entirely, keep hardened behavior.
// - Always return 200 when successful (even with empty body), 500 on errors.
// - Shared finalize() helper to build safe responses.
// - Keep: default JIT disabled, stderr noise filtering, __net, /public raw, full try/catch.

import wasmAsset from "../scripts/php_8_4.wasm";

// Minimal globals for Emscripten glue in Workers
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

type RunResult = {
  ok: boolean;
  stdout: string[];
  stderr: string[];
  debug: string[];
  exitStatus?: number;
  php?: any;
  error?: string;
};

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

// stderr noise filtering
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

// Unified finalizer to avoid 204-with-body
function finalizeOk(url: URL, res: RunResult, defaultCT: string) {
  const debugMode = url.searchParams.get("debug") === "1" || url.searchParams.get("showstderr") === "1";
  const stdout = res.stdout.join("\n");
  const { kept: errKept } = filterKnownNoise(res.stderr, debugMode);
  const err = errKept.join("\n");
  const ct = inferContentTypeFromOutput(stdout, defaultCT);
  const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";
  const body = (stdout || err) ? (stdout || err) + trace : "";

  // Never return 204/205/304. Use 200 if ok, 500 only when we explicitly return errors elsewhere.
  const status = (stdout || err) ? (stdout ? 200 : 500) : 200;

  // If body is empty, still safe to return 200 with empty body.
  return new Response(body, { status, headers: { "content-type": ct } });
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
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/html; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeInfo error: " + (e?.stack || String(e)), 500);
  }
}

async function routeRunGET(url: URL): Promise<Response> {
  try {
    const codeRaw = url.searchParams.get("code") ?? "";
    if (!codeRaw) return textResponse("Bad Request: missing code", 400);
    if (codeRaw.length > 64 * 1024) return textResponse("Payload Too Large", 413);
    const ini = parseIniParams(url);
    const argv = buildArgvForCode(codeRaw, ini);
    const res = await createPhpModuleAndRun(argv);
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/plain; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeRunGET error: " + (e?.stack || String(e)), 500);
  }
}

async function routeRunPOST(request: Request, url: URL): Promise<Response> {
  try {
    const code = await request.text();
    if (!code) return textResponse("Bad Request: empty body", 400);
    if (code.length > 256 * 1024) return textResponse("Payload Too Large", 413);
    const ini = parseIniParams(url);
    const argv = buildArgvForCode(code, ini);
    const res = await createPhpModuleAndRun(argv, 10000);
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/plain; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeRunPOST error: " + (e?.stack || String(e)), 500);
  }
}

async function routeRepoIndex(url: URL): Promise<Response> {
  try {
    const ref = url.searchParams.get("ref") || undefined;
    const mode = url.searchParams.get("mode") || "";
    const pull = await fetchGithubPhpSource("szzdmj", "wasmphp", "public/index.php", ref);
    if (!pull.ok) return textResponse(pull.err || "Fetch error", 502);

    if (mode === "raw") {
      return new Response(pull.code || "", { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    const ini = parseIniParams(url);
    const argv = buildArgvForCode(pull.code!, ini);
    const res = await createPhpModuleAndRun(argv, 10000);
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/html; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeRepoIndex error: " + (e?.stack || String(e)), 500);
  }
}

async function routeVersion(): Promise<Response> {
  try {
    const argv: string[] = [];
    for (const d of DEFAULT_INIS) { argv.push("-d", d); }
    argv.push("-v");
    const res = await createPhpModuleAndRun(argv);
    const body = (res.stdout.join("\n") || res.stderr.join("\n") || "") + (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
    return textResponse(body || "", res.ok ? 200 : 500);
  } catch (e: any) {
    return textResponse("routeVersion error: " + (e?.stack || String(e)), 500);
  }
}

async function routeHelp(): Promise<Response> {
  try {
    const argv: string[] = [];
    for (const d of DEFAULT_INIS) { argv.push("-d", d); }
    argv.push("-h");
    const res = await createPhpModuleAndRun(argv);
    const body = (res.stdout.join("\n") || res.stderr.join("\n") || "") + (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
    return textResponse(body || "", res.ok ? 200 : 500);
  } catch (e: any) {
    return textResponse("routeHelp error: " + (e?.stack || String(e)), 500);
  }
}

async function routeNet(url: URL): Promise<Response> {
  try {
    const ref = url.searchParams.get("ref") || "main";
    const test = await fetchGithubPhpSource("szzdmj", "wasmphp", "public/index.php", ref);
    return new Response(JSON.stringify(test, null, 2), { status: test.ok ? 200 : 502, headers: { "content-type": "application/json; charset=utf-8" } });
  } catch (e: any) {
    return textResponse("net error: " + (e?.stack || String(e)), 500);
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const { pathname } = url;

      if (pathname === "/health") return textResponse("ok");

      if (pathname === "/__probe") {
        try {
          let importMetaUrl: string | null = null;
          try { importMetaUrl = (import.meta as any)?.url ?? null; } catch { importMetaUrl = null; }
          const body = {
            env: {
              esm: true,
              hasWorkerCtor: typeof (globalThis as any).Worker !== "undefined",
              hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== "undefined",
              userAgent: (globalThis as any).navigator?.userAgent ?? null,
            },
            importMeta: { available: typeof import.meta !== "undefined", url: importMetaUrl },
          };
          return new Response(JSON.stringify(body, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
        } catch (e: any) {
          return textResponse("probe error: " + (e?.stack || String(e)), 500);
        }
      }

      if (pathname === "/__jsplus") {
        try {
          const mod = await import("../scripts/php_8_4.js");
          const def = (mod as any)?.default ?? null;
          const hasFactory = typeof def === "function";
          const payload = { imported: true, hasDefaultFactory: hasFactory, exportKeys: Object.keys(mod || {}), note: "import-only, no init" };
          return new Response(JSON.stringify(payload, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
        } catch (e: any) {
          return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
        }
      }

      if (pathname === "/__mod") {
        try {
          const argv = buildArgvForCode("echo 'ok';");
          const res = await createPhpModuleAndRun(argv);
          const summary = res.ok
            ? {
                keys: res.php ? Object.keys(res.php) : [],
                has: {
                  callMain: typeof (res.php as any)?.callMain === "function",
                  run: typeof (res.php as any)?.run === "function",
                  ccall: typeof (res.php as any)?.ccall === "function",
                  cwrap: typeof (res.php as any)?.cwrap === "function",
                  _main: typeof (res.php as any)?._main === "function",
                  FS: !!(res.php as any)?.FS,
                },
                calledRun: (res.php as any)?.calledRun ?? undefined,
                exitStatus: res.exitStatus ?? undefined,
                trace: res.debug,
                stdoutSample: (res.stdout || []).slice(0, 2),
                stderrSample: (res.stderr || []).slice(0, 2),
              }
            : { error: res.error, trace: res.debug, stderr: res.stderr.slice(0, 5) };
          return new Response(JSON.stringify(summary, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
        } catch (e: any) {
          return textResponse("mod error: " + (e?.stack || String(e)), 500);
        }
      }

      if (pathname === "/__net") {
        return routeNet(url);
      }

      if (pathname === "/" || pathname === "/index.php" || pathname === "/info") {
        return routeInfo(url);
      }

      if (pathname === "/public/index.php") {
        return routeRepoIndex(url);
      }

      if (pathname === "/run" && request.method === "GET") {
        return routeRunGET(url);
      }
      if (pathname === "/run" && request.method === "POST") {
        return routeRunPOST(request, url);
      }

      if (pathname === "/version") return routeVersion();
      if (pathname === "/help") return routeHelp();

      return textResponse("Not Found", 404);
    } catch (e: any) {
      // Final guard against 1101
      return textResponse("Top-level handler error: " + (e?.stack || String(e)), 500);
    }
  },
};
