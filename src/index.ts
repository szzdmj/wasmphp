export interface Env {
  PHP_WASM: Fetcher;
  STATIC_FILES: KVNamespace;
}

const STATIC_EXT = /\.(?:js|css|png|jpe?g|gif|svg|webp|ico|json|txt|woff2?|ttf|map|html?)$/i;

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // 1. 处理静态文件
    if (STATIC_EXT.test(pathname)) {
      // 优先读 KV
      const kvRes = await env.STATIC_FILES.get(pathname, { type: "arrayBuffer" });
      if (kvRes) {
        // 猜测 Content-Type
        const ext = pathname.split(".").pop()?.toLowerCase();
        const mimeMap: Record<string, string> = {
          js: "application/javascript",
          css: "text/css",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          gif: "image/gif",
          svg: "image/svg+xml",
          webp: "image/webp",
          ico: "image/x-icon",
          json: "application/json",
          txt: "text/plain",
          woff: "font/woff",
          woff2: "font/woff2",
          ttf: "font/ttf",
          map: "application/json",
          html: "text/html",
        };
        const contentType = mimeMap[ext || ""] || "application/octet-stream";
        return new Response(kvRes, {
          headers: { "Content-Type": contentType },
        });
      }
    }

    // 2. 处理 PHP 请求
    if (pathname.endsWith(".php") || pathname === "/") {
      const phpRes = await env.PHP_WASM.fetch(req);
      return phpRes;
    }

    // 3. 默认 404
    return new Response("Not Found", { status: 404 });
  },
};
