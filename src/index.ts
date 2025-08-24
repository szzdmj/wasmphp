import wasmBinary from "../scripts/php_8_4.wasm";
import { init as initPHP } from "../scripts/php_8_4.js";
import indexPhpSource from "../public/index.php";

// Global PHP instance for reuse across requests  
let phpModule: any = null;
let initPromise: Promise<void> | null = null;

async function ensureReady() {
  if (phpModule) return phpModule;
  if (!initPromise) {
    initPromise = (async () => {
      // Initialize PHP with wasmBinary - using the original working pattern
      const loader: any = { wasmBinary };
      phpModule = await initPHP("WORKER", loader);
    })();
  }
  await initPromise;
  return phpModule;
}

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Route / and /index.php to the PHP runtime
    const runPhp = url.pathname === "/" || url.pathname === "/index.php";
    if (!runPhp) {
      return new Response("PHP WASM initialized!", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    try {
      await ensureReady();
      
      // For now, demonstrate that routing works and PHP source is imported
      // This simulates what the actual PHP execution would return
      const simulatedPhpOutput = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>PHP WASM - Simulated phpinfo()</title>
</head>
<body>
<h1>PHP WASM Runtime - Routing Works!</h1>
<p><strong>Route:</strong> ${url.pathname}</p>
<p><strong>PHP Source Imported:</strong> ✓</p>
<p><strong>PHP Content:</strong></p>
<pre>${indexPhpSource}</pre>
<p><strong>PHP Module Initialized:</strong> ✓</p>
<p><strong>Note:</strong> This demonstrates successful routing and file import. The actual PHP execution would require resolving the WASM API for FS and callMain.</p>
</body>
</html>`;

      return new Response(simulatedPhpOutput, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, { status: 500 });
    }
  },
};
