import wasmBinary from "../scripts/php_8_4.wasm";
import { init as initPHP } from "../scripts/php_8_4.js";
import indexPhpSource from "../public/index.php";

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

    const stdout: string[] = [];
    const stderr: string[] = [];

    try {
      // Initialize PHP for this request so we can capture output deterministically
      const php = await initPHP("WORKER", {
        wasmBinary,
        print: (txt: string) => stdout.push(String(txt)),
        printErr: (txt: string) => stderr.push(String(txt)),
      });

      // Wait for runtime to be fully initialized
      if (php.onRuntimeInitialized && !php.FS) {
        await new Promise<void>((resolve) => {
          const originalCallback = php.onRuntimeInitialized;
          php.onRuntimeInitialized = () => {
            if (originalCallback) originalCallback();
            resolve();
          };
        });
      }

      // Debug: Check what we have after waiting
      const hasFS = php && 'FS' in php;
      const hasCallMain = php && 'callMain' in php;
      
      if (!hasFS || !hasCallMain) {
        return new Response(`Debug after waiting: FS available: ${hasFS}, callMain available: ${hasCallMain}\nPHP keys: ${Object.keys(php || {}).join(', ')}`, {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }

      // Prepare VFS and write /public/index.php
      try { php.FS.mkdir("/public"); } catch {}
      php.FS.writeFile("/public/index.php", indexPhpSource);

      // Execute: php /public/index.php
      try {
        php.callMain(["/public/index.php"]);
      } catch (e: any) {
        // Some builds throw ExitStatus on non-zero exit; log to stderr for troubleshooting
        if (e?.message) stderr.push(e.message);
      }

      const body = stdout.length ? stdout.join("") : (stderr.length ? stderr.join("\n") : "");
      const status = stdout.length ? 200 : (stderr.length ? 500 : 204);

      return new Response(body, {
        status,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    } catch (e: any) {
      const msg = e?.stack || e?.message || String(e);
      return new Response("Runtime error: " + msg, { status: 500 });
    }
  },
};
