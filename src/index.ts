export default {
  async fetch(_req: Request): Promise<Response> {
    try {
      return new Response("OK", {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    } catch (e: any) {
      return new Response("Runtime error: " + (e?.stack || e?.message || String(e)), {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
