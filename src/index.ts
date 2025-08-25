// V66k + KV + PublicRouting
// - 基于 V66k（auto-run + -r + base64 eval + shutdown flush），增加：
//   1) 从 KV 读取源码与静态资源（env.SRC）
//   2) 路由 /public/**/*.php：从 KV 取并执行
//   3) 路由 /public/** 非 .php：从 KV 取二进制并按扩展名返回
//   4) 首页 / 与 /index.php 读取并执行 KV 的 public/index.php
//   5) 可选 GitHub Raw 回退（启用后当 KV 未命中时从 GitHub 拉取，PHP 执行或静态直出）
//   6) 管理接口：/__put（二进制/文本上传到 KV）、/__kv 读取诊断、/__ls 列表
//
// 注意：
// - 仍不依赖 FS，因此 include/require 无法访问真实文件。多文件工程建议使用“Bundle”或“Manifest 拼接”。
// - KV 单值上限 25MB。大文件或大量文件建议前置打包或分片。
// - 若需要 Manifest 方案（从 KV 取清单拼接后执行），可以在此版本基础上加一个 routeManifest。

import wasmAsset from "../scripts/php_8_4.wasm";

/* -------------------- Config -------------------- */

// 开关：是否允许在 KV 未命中时回退到 GitHub Raw
const ENABLE_GH_FALLBACK = true;
// GitHub 回退仓库参数（用于直接映射 public/* 到 Static_Creation/public/*）
const GH_OWNER = "szzdmj";
const GH_REPO = "newcontainer";
// 注意：GitHub 上的路径为 Static_Creation/public/...，所以 BASE_DIR 设置为 Static_Creation
const GH_BASE_DIR = "Static_Creation";

/* -------------------- Emscripten globals shim -------------------- */

(function ensureGlobals() {
  const g = globalThis as any;
  if (typeof g.location === "undefined" || typeof g.location?.href === "undefined") {
    try {
      Object.defineProperty(g, "location", { value: { href: "file:///" }, configurable: true });
    } catch {}
  }
  if (typeof g.self === "undefined") {
    try {
      Object.defineProperty(g, "self", { value: g, configurable: true });
    } catch {}
  } else if (typeof g.self.location === "undefined" && typeof g.location !== "undefined") {
    try {
      g.self.location = g.location;
    } catch {}
  }
})();

/* -------------------- Constants -------------------- */

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

/* -------------------- Utils -------------------- */

function textResponse(body: string, status = 200, headers: Record<string, string> = {}) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8", ...headers } });
}

function sanitizePublicPath(pathname: string): { ok: boolean; key?: string; err?: string } {
  // 仅允许 /public/... 路径，禁止 .. 与重复斜杠
  if (!pathname.startsWith("/public/")) return { ok: false, err: "Path must start with /public/" };
  if (pathname.includes("..")) return { ok: false, err: "Path contains .." };
  // 规范化：去掉开头斜杠
  const key = pathname.replace(/^\/+/, "");
  if (!key || key.endsWith("/")) {
    // 目录结尾，尝试映射到 index.php
    const tryKey = (key ? key : "public/") + "index.php";
    return { ok: true, key: tryKey };
  }
  return { ok: true, key };
}

function guessMimeByExt(path: string): string {
  const i = path.lastIndexOf(".");
  const ext = i >= 0 ? path.slice(i + 1).toLowerCase() : "";
  switch (ext) {
    case "html":
    case "htm":
      return "text/html; charset=utf-8";
    case "css":
      return "text/css; charset=utf-8";
    case "js":
      return "application/javascript; charset=utf-8";
    case "mjs":
      return "application/javascript; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    case "txt":
      return "text/plain; charset=utf-8";
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "ico":
      return "image/x-icon";
    case "map":
      return "application/json; charset=utf-8";
    case "pdf":
      return "application/pdf";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "ogg":
      return "audio/ogg";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
      return "audio/mp4";
    case "woff":
      return "font/woff";
    case "woff2":
      return "font/woff2";
    case "ttf":
      return "font/ttf";
    case "otf":
      return "font/otf";
    case "eot":
      return "application/vnd.ms-fontobject";
    case "xml":
      return "application/xml; charset=utf-8";
    default:
      return "application/octet-stream";
  }
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

function normalizePhpCodeForEval(src: string): string {
  let s = src.trimStart();
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); // UTF-8 BOM
  if (s.startsWith("<?php")) s = s.slice(5);
  else if (s.startsWith("<?")) s = s.slice(2);
  s = s.replace(/\?>\s*$/s, "");
  return s;
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

function wrapCodeWithShutdownNewline(code: string): string {
  // 确保 Emscripten 的 stdout 在结束时刷新一行
  return `register_shutdown_function(function(){echo "\\n";}); ${code}`;
}

/* -------------------- KV Helpers -------------------- */

async function kvGetText(env: any, key: string): Promise<{ ok: boolean; text?: string; err?: string }> {
  try {
    if (!env?.SRC || typeof env.SRC.get !== "function") return { ok: false, err: "KV (SRC) not configured" };
    const v = await env.SRC.get(key, "text");
    if (v == null) return { ok: false, err: "KV miss" };
    return { ok: true, text: v };
  } catch (e: any) {
    return { ok: false, err: "KV get text failed: " + (e?.message || String(e)) };
  }
}

async function kvGetBytes(env: any, key: string): Promise<{ ok: boolean; bytes?: ArrayBuffer; err?: string }> {
  try {
    if (!env?.SRC || typeof env.SRC.get !== "function") return { ok: false, err: "KV (SRC) not configured" };
    const v = await env.SRC.get(key, "arrayBuffer");
    if (v == null) return { ok: false, err: "KV miss" };
    return { ok: true, bytes: v };
  } catch (e: any) {
    return { ok: false, err: "KV get bytes failed: " + (e?.message || String(e)) };
  }
}

/* -------------------- GitHub fallback -------------------- */

async function ghFetchText(owner: string, repo: string, path: string, ref?: string): Promise<{ ok: boolean; text?: string; err?: string; status?: number }> {
  try {
    const branch = (ref && ref.trim()) || "main";
    const url1 = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.replace(/^\/+/, "")}`;
    const headers: Record<string, string> = {
      "cache-control": "no-cache",
      "user-agent": "wasmphp-worker",
      "accept": "text/plain, */*",
    };
    let res = await fetch(url1, { headers });
    if (res.ok) return { ok: true, text: await res.text(), status: res.status };
    if (branch !== "master") {
      const url2 = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path.replace(/^\/+/, "")}`;
      res = await fetch(url2, { headers });
      if (res.ok) return { ok: true, text: await res.text(), status: res.status };
    }
    return { ok: false, err: `GH text fetch failed ${owner}/${repo}:${branch}/${path} (${res.status})`, status: res.status };
  } catch (e: any) {
    return { ok: false, err: "GH text fetch threw: " + (e?.message || String(e)) };
  }
}

async function ghFetchBytes(owner: string, repo: string, path: string, ref?: string): Promise<{ ok: boolean; bytes?: ArrayBuffer; err?: string; status?: number }> {
  try {
    const branch = (ref && ref.trim()) || "main";
    const url1 = `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${path.replace(/^\/+/, "")}`;
    const headers: Record<string, string> = {
      "cache-control": "no-cache",
      "user-agent": "wasmphp-worker",
      "accept": "*/*",
    };
    let res = await fetch(url1, { headers });
    if (res.ok) return { ok: true, bytes: await res.arrayBuffer(), status: res.status };
    if (branch !== "master") {
      const url2 = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path.replace(/^\/+/, "")}`;
      res = await fetch(url2, { headers });
      if (res.ok) return { ok: true, bytes: await res.arrayBuffer(), status: res.status };
    }
    return { ok: false, err: `GH bytes fetch failed ${owner}/${repo}:${branch}/${path} (${res.status})`, status: res.status };
  } catch (e: any) {
    return { ok: false, err: "GH bytes fetch threw: " + (e?.message || String(e)) };
  }
}

/* -------------------- PHP Runner (V66k) -------------------- */

function isWasmModule(x: any): x is WebAssembly.Module {
  return Object.prototype.toString.call(x) === "[object WebAssembly.Module]";
}
function makeInstantiateWithModule(wasmModule: WebAssembly.Module) {
  return (imports: WebAssembly.Imports, successCallback: (i: WebAssembly.Instance) => void) => {
    const instance = new WebAssembly.Instance(wasmModule, imports);
    try {
      successCallback(instance);
    } catch {}
    return instance.exports as any;
  };
}

async function buildInitOptions(base: Partial<any>) {
  const opts: any = {
    noInitialRun: false,
    print: () => {},
    printErr: () => {},
    onRuntimeInitialized: () => {},
    quit: (status: number, toThrow?: any) => {
      (opts as any).__exitStatus = status;
      (opts as any).__exitThrown = toThrow ? String(toThrow) : "";
    },
    ...base,
  };

  if (isWasmModule(wasmAsset)) {
    opts.instantiateWasm = makeInstantiateWithModule(wasmAsset as WebAssembly.Module);
    return opts;
  }
  if (typeof wasmAsset === "string") {
    const res = await fetch(wasmAsset);
    if (!res.ok) throw new Error(`Failed to fetch wasm: ${res.status}`);
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
  throw new Error("Unsupported wasm asset");
}

async function runAuto(argv: string[], waitMs = 8000): Promise<RunResult> {
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
    moduleOptions.print = (txt: string) => {
      try {
        stdout.push(String(txt));
      } catch {}
    };
    moduleOptions.printErr = (txt: string) => {
      try {
        stderr.push(String(txt));
      } catch {}
    };
    moduleOptions.onRuntimeInitialized = () => {
      debug.push("auto:event:onRuntimeInitialized");
    };

    debug.push("auto:init-factory");
    try {
      await (initCandidate as any)(moduleOptions);
    } catch (e1: any) {
      try {
        await (initCandidate as any)("WORKER", moduleOptions);
        debug.push("auto:factory:WORKER:ok");
      } catch (e2: any) {
        return {
          ok: false,
          stdout,
          stderr,
          debug,
          error: "autoRun factory failed: " + (e1?.message || e1) + " / " + (e2?.message || e2),
        };
      }
    }

    const start = Date.now();
    while (Date.now() - start < waitMs) {
      if (typeof moduleOptions.__exitStatus === "number") {
        exitStatus = moduleOptions.__exitStatus;
        debug.push("auto:exit:" + String(exitStatus));
        break;
      }
      if (stdout.length > 0) break;
      await new Promise((r) => setTimeout(r, 20));
    }

    return { ok: true, stdout, stderr, debug, exitStatus };
  } catch (e: any) {
    return { ok: false, stdout, stderr, debug: ["auto:catch-top", e?.message || String(e)], error: e?.stack || String(e) };
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
      if (re.test(t)) {
        ignored++;
        return false;
      }
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
    ]
      .filter(Boolean)
      .join("\n");
    body = hint;
    status = 200;
  }
  return new Response(body, { status, headers: { "content-type": ct } });
}

/* -------------------- Route helpers -------------------- */

async function execPhpCode(url: URL, code: string, waitMs = 10000): Promise<Response> {
  const ini = parseIniParams(url);
  const oneLiner = wrapCodeWithShutdownNewline(code);
  const argv = buildArgvForCode(oneLiner, ini);
  const res = await runAuto(argv, waitMs);
  if (!res.ok) {
    const body =
      (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
    return textResponse(body, 500);
  }
  return finalizeOk(url, res, "text/html; charset=utf-8");
}

async function routeInfo(url: URL): Promise<Response> {
  try {
    const argv = buildArgvForCode("phpinfo();");
    const res = await runAuto(argv);
    if (!res.ok) {
      const body =
        (res.stderr.join("\n") ? res.stderr.join("\n") + "\n" : "") + (res.error || "Unknown error") + "\ntrace: " + res.debug.join("->");
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
    return execPhpCode(url, codeRaw);
  } catch (e: any) {
    return textResponse("routeRunGET error: " + (e?.stack || String(e)), 500);
  }
}

async function routeRunPOST(request: Request, url: URL): Promise<Response> {
  try {
    const code = await request.text();
    if (!code) return textResponse("Bad Request: empty body", 400);
    if (code.length > 256 * 1024) return textResponse("Payload Too Large", 413);
    return execPhpCode(url, code, 10000);
  } catch (e: any) {
    return textResponse("routeRunPOST error: " + (e?.stack || String(e)), 500);
  }
}

async function routePhpFromKVOrGH(url: URL, env: any, key: string): Promise<Response> {
  const mode = url.searchParams.get("mode") || "";
  const ref = url.searchParams.get("ref") || undefined;

  // 1) KV 优先
  const kv = await kvGetText(env, key);
  if (kv.ok && typeof kv.text === "string") {
    const normalized = normalizePhpCodeForEval(kv.text);
    if (mode === "raw") return new Response(normalized, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
    const b64 = toBase64Utf8(normalized);
    return execPhpCode(url, `eval(base64_decode('${b64}'));`, 10000);
  }

  // 2) GH 回退（可选）
  if (ENABLE_GH_FALLBACK) {
    // 将 public/... 映射到 Static_Creation/public/...
    const ghPath = `${GH_BASE_DIR}/${key}`;
    const gh = await ghFetchText(GH_OWNER, GH_REPO, ghPath, ref);
    if (gh.ok && typeof gh.text === "string") {
      const normalized = normalizePhpCodeForEval(gh.text);
      if (mode === "raw") return new Response(normalized, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
      const b64 = toBase64Utf8(normalized);
      return execPhpCode(url, `eval(base64_decode('${b64}'));`, 10000);
    }
    return textResponse(kv.err || gh.err || "Source not found", 404);
  }

  return textResponse(kv.err || "KV source not found", 404);
}

async function routeStaticFromKVOrGH(url: URL, env: any, key: string): Promise<Response> {
  const ct = guessMimeByExt(key);
  const ref = url.searchParams.get("ref") || undefined;

  // 1) KV 优先
  const kv = await kvGetBytes(env, key);
  if (kv.ok && kv.bytes) {
    return new Response(kv.bytes, {
      status: 200,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=300",
      },
    });
  }

  // 2) GH 回退（可选）
  if (ENABLE_GH_FALLBACK) {
    const ghPath = `${GH_BASE_DIR}/${key}`;
    const gh = await ghFetchBytes(GH_OWNER, GH_REPO, ghPath, ref);
    if (gh.ok && gh.bytes) {
      return new Response(gh.bytes, {
        status: 200,
        headers: {
          "content-type": ct,
          "cache-control": "public, max-age=300",
        },
      });
    }
    return textResponse(kv.err || gh.err || "Asset not found", 404);
  }

  return textResponse(kv.err || "KV asset not found", 404);
}

async function routeHome(url: URL, env: any): Promise<Response> {
  // 首页等同于执行 KV 的 public/index.php
  return routePhpFromKVOrGH(url, env, "public/index.php");
}

/* -------------------- Admin/Diag -------------------- */

async function routeKvDiag(url: URL, env: any): Promise<Response> {
  try {
    const key = url.searchParams.get("key") || "public/index.php";
    const r = await kvGetText(env, key);
    return new Response(JSON.stringify({ ok: r.ok, hasText: r.ok ? true : false, err: r.err || null }, null, 2), {
      status: r.ok ? 200 : 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (e: any) {
    return textResponse("kv diag error: " + (e?.stack || String(e)), 500);
  }
}

async function routeKvList(url: URL, env: any): Promise<Response> {
  try {
    const prefix = url.searchParams.get("prefix") || "public/";
    if (!env?.SRC?.list) return textResponse("KV list unsupported", 500);
    const keys = await env.SRC.list({ prefix });
    return new Response(JSON.stringify(keys, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8" } });
  } catch (e: any) {
    return textResponse("kv list error: " + (e?.stack || String(e)), 500);
  }
}

function badKey(key: string) {
  return key.length > 1024 || key.includes("..") || key.startsWith("/") || key === "";
}

async function routeKvPut(request: Request, url: URL, env: any): Promise<Response> {
  try {
    if (!env?.SRC || typeof env.SRC.put !== "function") return textResponse("KV not configured", 500);
    const admin = (env as any).ADMIN_TOKEN;
    const token = request.headers.get("x-admin-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!admin || token !== admin) return textResponse("Unauthorized", 401);

    const key = url.searchParams.get("key") || "";
    if (badKey(key)) return textResponse("Bad key", 400);

    // 支持二进制与文本：直接取 ArrayBuffer 写入 KV 即可
    const ab = await request.arrayBuffer();
    if (!ab || ab.byteLength === 0) return textResponse("Empty body", 400);

    await env.SRC.put(key, ab as any, { expirationTtl: 0, metadata: { updatedAt: Date.now() } });
    return textResponse(`OK ${key} (${ab.byteLength} bytes)`, 200);
  } catch (e: any) {
    return textResponse("kv put error: " + (e?.stack || String(e)), 500);
  }
}

/* -------------------- Exported fetch -------------------- */

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    try {
      const url = new URL(request.url);
      const { pathname } = url;

      // Health
      if (pathname === "/health") return textResponse("ok");

      // Probe
      if (pathname === "/__probe") {
        try {
          let importMetaUrl: string | null = null;
          try {
            importMetaUrl = (import.meta as any)?.url ?? null;
          } catch {
            importMetaUrl = null;
          }
          const body = {
            env: {
              esm: true,
              hasWorkerCtor: typeof (globalThis as any).Worker !== "undefined",
              hasSharedArrayBuffer: typeof (globalThis as any).SharedArrayBuffer !== "undefined",
              userAgent: (globalThis as any).navigator?.userAgent ?? null,
              hasKV: !!env?.SRC,
              ghFallback: ENABLE_GH_FALLBACK,
              ghRepo: `${GH_OWNER}/${GH_REPO}`,
            },
            importMeta: { available: typeof import.meta !== "undefined", url: importMetaUrl },
          };
          return new Response(JSON.stringify(body, null, 2), {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch (e: any) {
          return textResponse("probe error: " + (e?.stack || String(e)), 500);
        }
      }

      // JS glue import diag
      if (pathname === "/__jsplus") {
        try {
          const mod = await import("../scripts/php_8_4.js");
          const def = (mod as any)?.default ?? null;
          const hasFactory = typeof def === "function";
          const payload = {
            imported: true,
            hasDefaultFactory: hasFactory,
            exportKeys: Object.keys(mod || {}),
            note: "import-only, no init",
          };
          return new Response(JSON.stringify(payload, null, 2), {
            status: 200,
            headers: { "content-type": "application/json; charset=utf-8" },
          });
        } catch (e: any) {
          return textResponse("Import glue failed:\n" + (e?.stack || String(e)), 500);
        }
      }

      // Admin/Diag
      if (pathname === "/__kv") return routeKvDiag(url, env);
      if (pathname === "/__ls") return routeKvList(url, env);
      if (pathname === "/__put" && (request.method === "POST" || request.method === "PUT")) return routeKvPut(request, url, env);

      // Home
      if (pathname === "/" || pathname === "/index.php") return routeHome(url, env);

      // Info / Run / Version / Help
      if (pathname === "/info") return routeInfo(url);
      if (pathname === "/run" && request.method === "GET") return routeRunGET(url);
      if (pathname === "/run" && request.method === "POST") return routeRunPOST(request, url);
      if (pathname === "/version") {
        const argv: string[] = [];
        for (const d of DEFAULT_INIS) argv.push("-d", d);
        argv.push("-v");
        const res = await runAuto(argv);
        const body =
          (res.stdout.join("\n") || res.stderr.join("\n") || "") +
          (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
        return textResponse(body || "", res.ok ? 200 : 500);
      }
      if (pathname === "/help") {
        const argv: string[] = [];
        for (const d of DEFAULT_INIS) argv.push("-d", d);
        argv.push("-h");
        const res = await runAuto(argv);
        const body =
          (res.stdout.join("\n") || res.stderr.join("\n") || "") +
          (res.debug.length ? `\ntrace:${res.debug.join("->")}` : "");
        return textResponse(body || "", res.ok ? 200 : 500);
      }

      // Public routing
      if (pathname.startsWith("/public/")) {
        const norm = sanitizePublicPath(pathname);
        if (!norm.ok || !norm.key) return textResponse(norm.err || "Bad path", 400);

        if (norm.key.toLowerCase().endsWith(".php")) {
          // 执行 PHP
          // 支持 ?mode=raw 查看源码
          return routePhpFromKVOrGH(url, env, norm.key);
        } else {
          // 静态资源（二进制返回）
          return routeStaticFromKVOrGH(url, env, norm.key);
        }
      }

      return textResponse("Not Found", 404);
    } catch (e: any) {
      // Final guard against 1101
      return textResponse("Top-level handler error: " + (e?.stack || String(e)), 500);
    }
  },
};
