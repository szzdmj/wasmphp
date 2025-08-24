export default {
  async fetch(req: Request): Promise<Response> {
    try {
      const url = new URL(req.url);

      if (url.pathname === "/__diag") {
        try {
          const wasmMod = await import("../scripts/php_8_4.wasm");
          const phpWasm = (wasmMod as any).default;
          const typeName = phpWasm?.constructor?.name || null;
          return new Response(
            JSON.stringify({ imported: !!phpWasm, type: typeName }),
            { headers: { "content-type": "application/json; charset=utf-8" } }
          );
        } catch (e: any) {
          return new Response(
            JSON.stringify({ imported: false, error: e?.message || String(e) }),
            { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
          );
        }
      }

      return new Response("OK", { headers: { "content-type": "text/plain; charset=utf-8" } });
    } catch (e: any) {
      return new Response("Runtime error: " + (e?.stack || e?.message || String(e)), {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }
  }
};
