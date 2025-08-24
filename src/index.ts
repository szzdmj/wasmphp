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
      // FIX: pass only a single options object to the Emscripten module factory
      const php: any = await initPHP({
        wasmBinary,
        print: (txt: string) => stdout.push(String(txt)),
        printErr: (txt: string) => stderr.push(String(txt)),
        noInitialRun: true,
      });

      if (!php?.FS || typeof php.FS.writeFile !== "function") {
        throw new Error("Emscripten FS not available on module after initPHP()");
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

      const body = stdout.length ? stdout.join("\n") : (stderr.length ? stderr.join("\n") : "");
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
