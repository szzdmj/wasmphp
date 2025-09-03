// V66k + KV: 在 V66k 基础上增加 Workers KV 源码读取与可选上传接口。
// - 保持 auto-run(noInitialRun=false) 工厂初始化；为避免“大代码通过 -r 作为 argv”引发的内存越界，首页执行改为“preRun 写入 MEMFS + 以文件路径作为 argv”。
// - /run 仍然走 -r（短代码），/ 首页与 /public/index.php 走“写文件 + 执行文件”路径，兼容打包顶层是否包含 public/。
// - 防御 Emscripten Module.arguments 非数组导致的 "Cannot assign to read only property '0'..."。

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
function buildArgvForFile(filePath: string, iniList: string[] = []): string[] {
  const argv: string[] = [];
  for (const d of DEFAULT_INIS) argv.push("-d", d);
  for (const d of iniList) if (d) argv.push("-d", d);
  // 直接以脚本文件路径作为最后一个参数，PHP CLI 会执行该文件
  argv.push(filePath);
  return argv;
}

// 防御性：确保传给 Emscripten 的 arguments 一定是字符串数组
function ensureArgvArray(x: any): string[] {
  if (Array.isArray(x)) return x.slice();
  if (x == null) return [];
  if (typeof x === "string") return [x];
  try { return Array.from(x as any).map(String); } catch { return [String(x)]; }
}

async function buildInitOptions(base: Partial<any>) {
  const opts: any = {
    noInitialRun: false, // auto-run
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    quit: (status: number, toThrow?: any) => {
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
    ...base,
  };

  // 关键修复：Emscripten glue 会写 argv[0]，若 arguments 被传成字符串会抛错
  if ("arguments" in opts) {
    opts.arguments = ensureArgvArray((opts as any).arguments);
  }

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

function toUint8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

// Auto-run runner，支持可选 preRun 钩子（用于先写入 MEMFS）
async function runAuto(argv: string[], waitMs = 8000, preRun?: Array<() => void>): Promise<RunResult> {
  const debug: string[] = [];
  const stdout: string[] = [];
  const stderr: string[] = [];
  let exitStatus: number | undefined;
  try {
    debug.push("auto:import-glue");
    const phpModule = await import("../scripts/php_8_4.js");
    const initCandidate = (phpModule as any).init || (phpModule as any).default || (phpModule as any);
    if (typeof initCandidate !== "function") {
      return { ok: false, stdout, stderr, debug, error: "PHP init factory not found" };
    }
    debug.push("auto:build-options");
    const moduleOptions: any = await buildInitOptions({ arguments: argv.slice() });
    moduleOptions.print = (txt: string) => { try { stdout.push(String(txt)); } catch {} };
    moduleOptions.printErr = (txt: string) => { try { stderr.push(String(txt)); } catch {} };
    moduleOptions.onRuntimeInitialized = () => { debug.push("auto:event:onRuntimeInitialized"); };

    if (preRun && preRun.length) {
      const prev = Array.isArray(moduleOptions.preRun) ? moduleOptions.preRun : (moduleOptions.preRun ? [moduleOptions.preRun] : []);
      moduleOptions.preRun = prev.concat(preRun);
    }

    debug.push("auto:init-factory");
    try {
      await (initCandidate as any)(moduleOptions);
      debug.push("auto:factory:ok");
    } catch (e1: any) {
      try {
        await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("auto:factory:WORKER:ok");
      } catch (e2: any) {
        return { ok: false, stdout, stderr, debug, error: "autoRun factory failed: " + (e1?.message || e1) + " / " + (e2?.message || e2) };
      }
    }

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") { exitStatus = moduleOptions.__exitStatus; debug.push("auto:exit:" + String(exitStatus)); break; }
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    return { ok: true, stdout, stderr, debug, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["auto:catch-top", e?.message || String(e)], error: e?.stack || String(e) };
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
function finalizeOk(url: URL, res: RunResult, defaultCT: string) {
  const debugMode = url.searchParams.get("debug") === "1" || url.searchParams.get("showstderr") === "1";
  const stdout = res.stdout.join("\n");
  const filtered = filterKnownNoise(res.stderr, debugMode);
  const err = filtered.kept.join("\n");
  const ct = inferContentTypeFromOutput(stdout, defaultCT);
  const trace = res.debug.length ? `\n<!-- trace:${res.debug.join("->")} -->` : "";

  let body = "";
  let status = 200;

  if (stdout) {
    body = stdout + trace;
  } else if (err) {
    body = err + trace;
    status = 500;
  } else {
    const hint = [
      "[wasmphp] No output from PHP script.",
      `exitStatus=${typeof res.exitStatus === "number" ? res.exitStatus : "unknown"}`,
      `stderr_filtered_lines=${filtered.ignored}`,
      res.debug.length ? `trace=${res.debug.join("->")}` : "",
      "Tip: append ?debug=1 to see unfiltered stderr.",
    ].filter(Boolean).join("\n");
    body = hint;
    status = 200;
  }
  return new Response(body, { status, headers: { "content-type": ct } });
}

// —— Sources: KV first, then GitHub fallback ——
function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
}

// 根据 preferKey 生成候选 key，兼容是否包含 public/ 前缀
function buildKeyCandidates(preferKey?: string | null): string[] {
  const candidates: string[] = [];
  const add = (k: string) => {
    const kk = k.replace(/^\/+/, ""); // 去掉开头的 /
    if (!candidates.includes(kk)) candidates.push(kk);
  };

  if (preferKey && preferKey.trim()) {
    const base = preferKey.replace(/^\/+/, "");
    add(base);
    if (base.startsWith("public/")) {
      add(base.slice("public/".length));
    } else {
      add("public/" + base);
    }
  } else {
    add("public/index.php");
    add("index.php");
  }
  return candidates;
}

async function fetchKVPhpSource(env: any, key: string): Promise<{ ok: boolean; code?: string; err?: string }> {
  try {
    if (!env || !env.SRC || typeof env.SRC.get !== "function") {
      return { ok: false, err: "KV binding SRC is not configured" };
    }
    const txt = await env.SRC.get(key, "text");
    if (txt == null) return { ok: false, err: `KV object not found: ${key}` };
    return { ok: true, code: normalizePhpCodeForEval(txt) };
  } catch (e: any) {
    return { ok: false, err: "KV get failed: " + (e?.message || String(e)) };
  }
}

async function fetchKVFirstAvailable(env: any, keys: string[]): Promise<{ ok: boolean; code?: string; usedKey?: string; err?: string }> {
  if (!env || !env.SRC || typeof env.SRC.get !== "function") {
    return { ok: false, err: "KV binding SRC is not configured" };
  }
  let lastErr = "";
  for (const k of keys) {
    try {
      const txt = await env.SRC.get(k, "text");
      if (txt != null) {
        return { ok: true, code: normalizePhpCodeForEval(txt), usedKey: k };
      }
    } catch (e: any) {
      lastErr = e?.message || String(e);
    }
  }
  return { ok: false, err: lastErr || `KV objects not found: ${keys.join(", ")}` };
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

function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ——— Routes ———
async function routeInfo(url: URL): Promise<Response> {
  try {
    const argv = buildArgvForCode("phpinfo();");
    const res = await runAuto(argv);
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/html; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeInfo error: " + (e?.stack || String(e)), 500);
  }
}
function wrapCodeWithShutdownNewline(code: string): string {
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}
async function routeRunGET(url: URL): Promise<Response> {
  try {
    const codeRaw = url.searchParams.get("code") ?? "";
    if (!codeRaw) return textResponse("Bad Request: missing code", 400);
    if (codeRaw.length > 64 * 1024) return textResponse("Payload Too Large", 413);
    const ini = parseIniParams(url);
    const argv = buildArgvForCode(wrapCodeWithShutdownNewline(codeRaw), ini);
    const res = await runAuto(argv);
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
    const argv = buildArgvForCode(wrapCodeWithShutdownNewline(code), ini);
    const res = await runAuto(argv, 10000);
    if (!res.ok) {
      const body = (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
      return textResponse(body, 500);
    }
    return finalizeOk(url, res, "text/plain; charset=utf-8");
  } catch (e: any) {
    return textResponse("routeRunPOST error: " + (e?.stack || String(e)), 500);
  }
}

// 兼容 KV key 结构（带/不带 public 前缀）并支持 GitHub 回退
async function routeRepoIndex(url: URL, env: any): Promise<Response> {
  try {
    const ref = url.searchParams.get("ref") || undefined;
    const mode = url.searchParams.get("mode") || "";
    const preferredKeyParam = url.searchParams.get("key");
    const candidates = buildKeyCandidates(preferredKeyParam ?? "public/index.php");

    // 1) 优先从 KV 读（尝试多个候选 key）
    let codeNormalized: string | undefined;
    if (env && env.SRC) {
      const kv = await fetchKVFirstAvailable(env, candidates);
      if (kv.ok) codeNormalized = kv.code!;
    }

    // 2) KV 没拿到则回退 GitHub（容灾），同样尝试候选路径
    if (!codeNormalized) {
      let ghErr = "";
      for (const path of candidates) {
        const pull = await fetchGithubPhpSource("szzdmj", "wasmphp", path, ref);
        if (pull.ok) {
          codeNormalized = pull.code || "";
          break;
        } else {
          ghErr = pull.err || ghErr;
        }
      }
      if (!codeNormalized) return textResponse(ghErr || "Fetch error", 502);
    }

    if (mode === "raw") {
      return new Response(codeNormalized!, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    }

    // 关键改动：使用 MEMFS 写入脚本文件，避免把大代码放进 argv 导致初始化 OOB
    const scriptPath = "/__wasmphp__/index.php";
    const preRun: Array<() => void> = [() => {
      const FS = (globalThis as any).FS;
      if (!FS) return;
      try { FS.mkdir("/__wasmphp__"); } catch {}
      try { FS.unlink(scriptPath); } catch {}
      const code = wrapCodeWithShutdownNewline(codeNormalized!);
      FS.writeFile(scriptPath, toUint8(code));
    }];

    const ini = parseIniParams(url);
    const argv = buildArgvForFile(scriptPath, ini);
    const res = await runAuto(argv, 12000, preRun);
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
    const res = await runAuto(argv);
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
    const res = await runAuto(argv);
    const body = (res.stdout.join("\n") || res.stderr.join("\n") || "") + (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
    return textResponse(body || "", res.ok ? 200 : 500);
  } catch (e: any) {
    return textResponse("routeHelp error: " + (e?.stack || String(e)), 500);
  }
}

// —— KV 诊断与受保护上传 —— //
async function routeKvDiag(url: URL, env: any): Promise<Response> {
  try {
    const preferredKeyParam = url.searchParams.get("key");
    const tryAll = url.searchParams.get("try") === "1";
    if (!tryAll) {
      const key = preferredKeyParam || "public/index.php";
      const r = await fetchKVPhpSource(env, key);
      return new Response(JSON.stringify(r, null, 2), { status: r.ok ? 200 : 502, headers: { "content-type": "application/json; charset=utf-8" } });
    } else {
      const candidates = buildKeyCandidates(preferredKeyParam ?? "public/index.php");
      const found = await fetchKVFirstAvailable(env, candidates);
      return new Response(JSON.stringify({ candidates, result: found }, null, 2), { status: found.ok ? 200 : 502, headers: { "content-type": "application/json; charset=utf-8" } });
    }
  } catch (e: any) {
    return textResponse("kv diag error: " + (e?.stack || String(e)), 500);
  }
}
function badKey(key: string) {
  // 简单校验，避免非法 key
  return key.length > 512 || key.includes("..") || key.startsWith("/") || key === "";
}
async function routeKvPut(request: Request, url: URL, env: any): Promise<Response> {
  try {
    if (!env?.SRC || typeof env.SRC.put !== "function") return textResponse("KV not configured", 500);
    const admin = (env as any).ADMIN_TOKEN;
    const token = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!admin || token !== admin) return textResponse("Unauthorized", 401);

    const key = (url.searchParams.get("key") || "").replace(/^\/+/, "");
    if (badKey(key)) return textResponse("Bad key", 400);

    const body = await request.text();
    if (!body) return textResponse("Empty body", 400);

    await env.SRC.put(key, body, { expirationTtl: 0, metadata: { updatedAt: Date.now() } });
    return textResponse("OK", 200);
  } catch (e: any) {
    return textResponse("kv put error: " + (e?.stack || String(e)), 500);
  }
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
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
              hasKV: !!env?.SRC,
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

      if (pathname === "/__kv") {
        return routeKvDiag(url, env);
      }
      if (pathname === "/__put" && (request.method === "POST" || request.method === "PUT")) {
        return routeKvPut(request, url, env);
      }

      // Home: render KV's /public/index.php (fallback GitHub)
      if (pathname === "/" || pathname === "/index.php" || pathname === "/public/index.php") {
        return routeRepoIndex(url, env);
      }

      if (pathname === "/info") return routeInfo(url);
      if (pathname === "/run" && request.method === "GET") return routeRunGET(url);
      if (pathname === "/run" && request.method === "POST") return routeRunPOST(request, url);
      if (pathname === "/version") return routeVersion();
      if (pathname === "/help") return routeHelp();

      return textResponse("Not Found", 404);
    } catch (e: any) {
      // Final guard against 1101
      return textResponse("Top-level handler error: " + (e?.stack || String(e)), 500);
    }
  },
};
